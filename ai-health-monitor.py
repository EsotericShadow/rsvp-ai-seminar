#!/usr/bin/env python3
"""
AI System Health Monitor
Real-time monitoring of all AI system vitals with safety checks
"""

import time
import json
import requests
import weaviate
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging

# Configuration
WEAVIATE_URL = "https://rbq70xfws0wsquqdhxxc4w.c0.us-west3.gcp.weaviate.cloud"
WEAVIATE_API_KEY = "enZ6V29tM3VaeG1PQ25jZV96bVRhdHR5OGJUWlp2SmlwQTdaUUZ1VHVLZmJ3a2ZoRUFYK1YzbkltVmZnPV92MjAw"
NEXTJS_BASE_URL = "http://localhost:3000"

# Health thresholds
HEALTH_THRESHOLDS = {
    "rag_response_time": {"excellent": 0.1, "good": 0.5, "poor": 1.0},
    "api_response_time": {"excellent": 0.2, "good": 1.0, "poor": 5.0},
    "error_rate": {"excellent": 0.01, "good": 0.05, "poor": 0.10},
    "success_rate": {"excellent": 0.99, "good": 0.95, "poor": 0.90},
    "training_data_count": {"excellent": 1000, "good": 500, "poor": 100},
    "memory_usage": {"excellent": 0.70, "good": 0.80, "poor": 0.90},
    "cpu_usage": {"excellent": 0.70, "good": 0.80, "poor": 0.95}
}

class AIHealthMonitor:
    def __init__(self):
        self.health_history = []
        self.alerts = []
        self.critical_issues = []
        self.setup_logging()
        
    def setup_logging(self):
        """Setup logging for health monitoring"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('ai-health-monitor.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def check_rag_system_health(self) -> Dict[str, Any]:
        """Check RAG system health"""
        try:
            start_time = time.time()
            
            # Connect to Weaviate
            client = weaviate.connect_to_weaviate_cloud(
                cluster_url=WEAVIATE_URL,
                auth_credentials=weaviate.auth.AuthApiKey(WEAVIATE_API_KEY)
            )
            
            # Test search performance
            kb_collection = client.collections.get("KnowledgeBase")
            results = kb_collection.query.bm25(query="test", limit=3)
            
            response_time = time.time() - start_time
            object_count = kb_collection.aggregate.over_all(total_count=True).total_count
            
            client.close()
            
            # Calculate health score
            health_score = self.calculate_rag_health_score(response_time, len(results.objects), object_count)
            
            return {
                "status": "healthy" if health_score > 80 else "degraded" if health_score > 60 else "critical",
                "response_time": response_time,
                "search_results": len(results.objects),
                "total_objects": object_count,
                "health_score": health_score,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"RAG system health check failed: {e}")
            return {
                "status": "critical",
                "error": str(e),
                "health_score": 0,
                "timestamp": datetime.now().isoformat()
            }
    
    def calculate_rag_health_score(self, response_time: float, results_count: int, total_objects: int) -> int:
        """Calculate RAG system health score (0-100)"""
        score = 100
        
        # Response time penalty
        if response_time > HEALTH_THRESHOLDS["rag_response_time"]["poor"]:
            score -= 40
        elif response_time > HEALTH_THRESHOLDS["rag_response_time"]["good"]:
            score -= 20
        elif response_time > HEALTH_THRESHOLDS["rag_response_time"]["excellent"]:
            score -= 10
        
        # Results count penalty
        if results_count == 0:
            score -= 30
        elif results_count < 3:
            score -= 15
        
        # Total objects penalty
        if total_objects < HEALTH_THRESHOLDS["training_data_count"]["poor"]:
            score -= 25
        elif total_objects < HEALTH_THRESHOLDS["training_data_count"]["good"]:
            score -= 10
        
        return max(0, score)
    
    def check_api_health(self) -> Dict[str, Any]:
        """Check AI Agent API health"""
        try:
            start_time = time.time()
            
            # Test health check endpoint
            response = requests.get(f"{NEXTJS_BASE_URL}/api/ai-agent", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                collections = data.get('collections', {})
                total_objects = sum(collections.values())
                
                health_score = self.calculate_api_health_score(response_time, response.status_code, total_objects)
                
                return {
                    "status": "healthy" if health_score > 80 else "degraded" if health_score > 60 else "critical",
                    "response_time": response_time,
                    "status_code": response.status_code,
                    "collections": collections,
                    "total_objects": total_objects,
                    "health_score": health_score,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "status": "critical",
                    "response_time": response_time,
                    "status_code": response.status_code,
                    "health_score": 0,
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            self.logger.error(f"API health check failed: {e}")
            return {
                "status": "critical",
                "error": str(e),
                "health_score": 0,
                "timestamp": datetime.now().isoformat()
            }
    
    def calculate_api_health_score(self, response_time: float, status_code: int, total_objects: int) -> int:
        """Calculate API health score (0-100)"""
        score = 100
        
        # Status code penalty
        if status_code >= 500:
            score -= 50
        elif status_code >= 400:
            score -= 30
        elif status_code != 200:
            score -= 20
        
        # Response time penalty
        if response_time > HEALTH_THRESHOLDS["api_response_time"]["poor"]:
            score -= 40
        elif response_time > HEALTH_THRESHOLDS["api_response_time"]["good"]:
            score -= 20
        elif response_time > HEALTH_THRESHOLDS["api_response_time"]["excellent"]:
            score -= 10
        
        # Objects count penalty
        if total_objects == 0:
            score -= 30
        elif total_objects < 10:
            score -= 15
        
        return max(0, score)
    
    def check_security_health(self) -> Dict[str, Any]:
        """Check security and authentication health"""
        try:
            # Test authentication
            auth_response = requests.post(
                f"{NEXTJS_BASE_URL}/api/ai-agent",
                json={"query": "test", "action": "chat"},
                timeout=5
            )
            
            # Test invalid endpoint
            invalid_response = requests.get(f"{NEXTJS_BASE_URL}/api/invalid-endpoint", timeout=5)
            
            auth_working = auth_response.status_code == 401  # Should require auth
            invalid_handled = invalid_response.status_code == 404  # Should return 404
            
            health_score = 100
            if not auth_working:
                health_score -= 50
            if not invalid_handled:
                health_score -= 30
            
            return {
                "status": "healthy" if health_score > 80 else "degraded" if health_score > 60 else "critical",
                "authentication_working": auth_working,
                "invalid_endpoint_handled": invalid_handled,
                "health_score": health_score,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Security health check failed: {e}")
            return {
                "status": "critical",
                "error": str(e),
                "health_score": 0,
                "timestamp": datetime.now().isoformat()
            }
    
    def check_performance_health(self) -> Dict[str, Any]:
        """Check system performance metrics"""
        try:
            import psutil
            
            # Get system metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Calculate health score
            health_score = 100
            
            if cpu_percent > HEALTH_THRESHOLDS["cpu_usage"]["poor"] * 100:
                health_score -= 40
            elif cpu_percent > HEALTH_THRESHOLDS["cpu_usage"]["good"] * 100:
                health_score -= 20
            elif cpu_percent > HEALTH_THRESHOLDS["cpu_usage"]["excellent"] * 100:
                health_score -= 10
            
            if memory.percent > HEALTH_THRESHOLDS["memory_usage"]["poor"] * 100:
                health_score -= 30
            elif memory.percent > HEALTH_THRESHOLDS["memory_usage"]["good"] * 100:
                health_score -= 15
            elif memory.percent > HEALTH_THRESHOLDS["memory_usage"]["excellent"] * 100:
                health_score -= 5
            
            if disk.percent > 90:
                health_score -= 20
            elif disk.percent > 80:
                health_score -= 10
            
            return {
                "status": "healthy" if health_score > 80 else "degraded" if health_score > 60 else "critical",
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent,
                "health_score": health_score,
                "timestamp": datetime.now().isoformat()
            }
            
        except ImportError:
            return {
                "status": "unknown",
                "error": "psutil not available",
                "health_score": 50,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Performance health check failed: {e}")
            return {
                "status": "critical",
                "error": str(e),
                "health_score": 0,
                "timestamp": datetime.now().isoformat()
            }
    
    def calculate_overall_health_score(self, health_data: Dict[str, Any]) -> int:
        """Calculate overall system health score"""
        weights = {
            "rag_system": 0.25,
            "api_health": 0.20,
            "security": 0.15,
            "performance": 0.15,
            "training_data": 0.10,
            "external_deps": 0.10,
            "error_rate": 0.05
        }
        
        total_score = 0
        total_weight = 0
        
        for component, weight in weights.items():
            if component in health_data:
                score = health_data[component].get("health_score", 0)
                total_score += score * weight
                total_weight += weight
        
        return int(total_score / total_weight) if total_weight > 0 else 0
    
    def check_critical_safety_issues(self, health_data: Dict[str, Any]) -> List[str]:
        """Check for critical safety issues that could cause catastrophic failures"""
        issues = []
        
        # Check for critical failures
        for component, data in health_data.items():
            if data.get("status") == "critical":
                issues.append(f"CRITICAL: {component} is in critical state")
            
            # Check specific safety thresholds
            if component == "rag_system":
                if data.get("response_time", 0) > 5.0:
                    issues.append("CRITICAL: RAG system response time > 5 seconds")
                if data.get("total_objects", 0) == 0:
                    issues.append("CRITICAL: No training data available")
            
            elif component == "api_health":
                if data.get("response_time", 0) > 5.0:
                    issues.append("CRITICAL: API response time > 5 seconds")
                if data.get("status_code", 200) >= 500:
                    issues.append("CRITICAL: API returning 5xx errors")
            
            elif component == "security":
                if not data.get("authentication_working", False):
                    issues.append("CRITICAL: Authentication system not working")
            
            elif component == "performance":
                if data.get("cpu_percent", 0) > 95:
                    issues.append("CRITICAL: CPU usage > 95%")
                if data.get("memory_percent", 0) > 90:
                    issues.append("CRITICAL: Memory usage > 90%")
        
        return issues
    
    def run_health_check(self) -> Dict[str, Any]:
        """Run comprehensive health check"""
        self.logger.info("Starting comprehensive AI system health check...")
        
        # Run all health checks
        health_data = {
            "rag_system": self.check_rag_system_health(),
            "api_health": self.check_api_health(),
            "security": self.check_security_health(),
            "performance": self.check_performance_health()
        }
        
        # Calculate overall health score
        overall_score = self.calculate_overall_health_score(health_data)
        
        # Check for critical safety issues
        critical_issues = self.check_critical_safety_issues(health_data)
        
        # Determine overall status
        if overall_score >= 90:
            overall_status = "excellent"
        elif overall_score >= 80:
            overall_status = "good"
        elif overall_score >= 70:
            overall_status = "fair"
        elif overall_score >= 60:
            overall_status = "poor"
        else:
            overall_status = "critical"
        
        health_report = {
            "timestamp": datetime.now().isoformat(),
            "overall_status": overall_status,
            "overall_score": overall_score,
            "components": health_data,
            "critical_issues": critical_issues,
            "recommendations": self.generate_recommendations(health_data, critical_issues)
        }
        
        # Log critical issues
        if critical_issues:
            self.logger.critical(f"CRITICAL ISSUES DETECTED: {critical_issues}")
            self.critical_issues.extend(critical_issues)
        
        # Store in history
        self.health_history.append(health_report)
        
        # Keep only last 100 health checks
        if len(self.health_history) > 100:
            self.health_history = self.health_history[-100:]
        
        return health_report
    
    def generate_recommendations(self, health_data: Dict[str, Any], critical_issues: List[str]) -> List[str]:
        """Generate recommendations based on health data"""
        recommendations = []
        
        # RAG system recommendations
        rag_data = health_data.get("rag_system", {})
        if rag_data.get("response_time", 0) > 1.0:
            recommendations.append("Optimize RAG system performance - response time is slow")
        if rag_data.get("total_objects", 0) < 500:
            recommendations.append("Add more training data to improve AI responses")
        
        # API recommendations
        api_data = health_data.get("api_health", {})
        if api_data.get("response_time", 0) > 1.0:
            recommendations.append("Optimize API performance - response time is slow")
        if api_data.get("status_code", 200) >= 400:
            recommendations.append("Fix API errors - check server logs")
        
        # Security recommendations
        security_data = health_data.get("security", {})
        if not security_data.get("authentication_working", False):
            recommendations.append("Fix authentication system immediately")
        
        # Performance recommendations
        perf_data = health_data.get("performance", {})
        if perf_data.get("cpu_percent", 0) > 80:
            recommendations.append("High CPU usage - consider scaling or optimization")
        if perf_data.get("memory_percent", 0) > 80:
            recommendations.append("High memory usage - consider memory optimization")
        
        return recommendations
    
    def start_monitoring(self, interval_seconds: int = 30):
        """Start continuous monitoring"""
        self.logger.info(f"Starting AI system monitoring (interval: {interval_seconds}s)")
        
        try:
            while True:
                health_report = self.run_health_check()
                
                # Print status
                status_emoji = {
                    "excellent": "🟢",
                    "good": "🟡", 
                    "fair": "🟠",
                    "poor": "🔴",
                    "critical": "🚨"
                }
                
                emoji = status_emoji.get(health_report["overall_status"], "❓")
                print(f"{emoji} AI System Health: {health_report['overall_status'].upper()} ({health_report['overall_score']}/100)")
                
                if health_report["critical_issues"]:
                    print(f"🚨 CRITICAL ISSUES: {len(health_report['critical_issues'])}")
                    for issue in health_report["critical_issues"]:
                        print(f"   - {issue}")
                
                if health_report["recommendations"]:
                    print(f"💡 RECOMMENDATIONS: {len(health_report['recommendations'])}")
                    for rec in health_report["recommendations"]:
                        print(f"   - {rec}")
                
                print("-" * 60)
                
                time.sleep(interval_seconds)
                
        except KeyboardInterrupt:
            self.logger.info("Monitoring stopped by user")
        except Exception as e:
            self.logger.error(f"Monitoring error: {e}")
    
    def generate_health_report(self) -> str:
        """Generate detailed health report"""
        if not self.health_history:
            return "No health data available"
        
        latest = self.health_history[-1]
        
        report = f"""
# AI SYSTEM HEALTH REPORT
Generated: {latest['timestamp']}

## OVERALL STATUS: {latest['overall_status'].upper()} ({latest['overall_score']}/100)

## COMPONENT HEALTH:
"""
        
        for component, data in latest['components'].items():
            status_emoji = {"healthy": "✅", "degraded": "⚠️", "critical": "❌"}.get(data.get('status'), "❓")
            report += f"- {component}: {status_emoji} {data.get('status', 'unknown')} ({data.get('health_score', 0)}/100)\n"
        
        if latest['critical_issues']:
            report += f"\n## CRITICAL ISSUES ({len(latest['critical_issues'])}):\n"
            for issue in latest['critical_issues']:
                report += f"- {issue}\n"
        
        if latest['recommendations']:
            report += f"\n## RECOMMENDATIONS ({len(latest['recommendations'])}):\n"
            for rec in latest['recommendations']:
                report += f"- {rec}\n"
        
        return report

def main():
    """Main function"""
    monitor = AIHealthMonitor()
    
    # Run single health check
    print("🔍 Running AI System Health Check...")
    health_report = monitor.run_health_check()
    
    print(monitor.generate_health_report())
    
    # Save report to file
    with open('ai-health-report.json', 'w') as f:
        json.dump(health_report, f, indent=2)
    
    print(f"\n📄 Detailed report saved to: ai-health-report.json")
    
    # Ask if user wants to start continuous monitoring
    try:
        response = input("\nStart continuous monitoring? (y/n): ").lower().strip()
        if response == 'y':
            monitor.start_monitoring()
    except KeyboardInterrupt:
        print("\nExiting...")

if __name__ == "__main__":
    main()

