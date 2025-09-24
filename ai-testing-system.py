#!/usr/bin/env python3
"""
AI Testing System for RSVP Campaign Management
Real-time monitoring, sanity checking, and guided task execution
"""

import json
import time
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    WAITING_CONFIRMATION = "waiting_confirmation"
    CONFIRMED = "confirmed"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class SanityLevel(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"

@dataclass
class AITask:
    id: str
    user_command: str
    ai_interpretation: str
    planned_actions: List[Dict[str, Any]]
    current_step: int
    status: TaskStatus
    sanity_level: SanityLevel
    sanity_score: float
    execution_log: List[Dict[str, Any]]
    requires_confirmation: bool
    confirmation_prompt: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None

class AISanityMonitor:
    """Monitors AI decision-making sanity and provides warnings"""
    
    def __init__(self):
        self.sanity_checks = {
            'command_interpretation': self.check_command_interpretation,
            'action_planning': self.check_action_planning,
            'safety_measures': self.check_safety_measures,
            'data_validation': self.check_data_validation,
            'permission_check': self.check_permissions
        }
    
    def check_command_interpretation(self, task: AITask) -> Dict[str, Any]:
        """Check if AI correctly interpreted the user command"""
        score = 100.0
        issues = []
        
        # Check for dangerous commands
        dangerous_keywords = ['delete', 'remove', 'destroy', 'wipe', 'clear all']
        user_command_lower = task.user_command.lower()
        
        for keyword in dangerous_keywords:
            if keyword in user_command_lower:
                score -= 20
                issues.append(f"Dangerous keyword detected: {keyword}")
        
        # Check for ambiguous commands
        ambiguous_phrases = ['all', 'everything', 'everyone', 'bulk', 'mass']
        for phrase in ambiguous_phrases:
            if phrase in user_command_lower:
                score -= 10
                issues.append(f"Ambiguous command detected: {phrase}")
        
        # Check if interpretation makes sense
        if len(task.ai_interpretation) < 10:
            score -= 15
            issues.append("AI interpretation too brief")
        
        return {
            'score': max(0, score),
            'issues': issues,
            'recommendation': 'good' if score > 80 else 'review_required'
        }
    
    def check_action_planning(self, task: AITask) -> Dict[str, Any]:
        """Check if AI's action plan is sensible and safe"""
        score = 100.0
        issues = []
        
        # Check for destructive actions
        destructive_actions = ['delete', 'remove', 'clear', 'wipe']
        for action in task.planned_actions:
            action_str = json.dumps(action).lower()
            for destructive in destructive_actions:
                if destructive in action_str:
                    score -= 25
                    issues.append(f"Destructive action planned: {destructive}")
        
        # Check for bulk operations without confirmation
        if len(task.planned_actions) > 5:
            score -= 15
            issues.append("Large number of actions planned - needs confirmation")
        
        # Check for missing validation steps
        has_validation = any('validate' in str(action).lower() or 'check' in str(action).lower() 
                           for action in task.planned_actions)
        if not has_validation and len(task.planned_actions) > 1:
            score -= 10
            issues.append("No validation steps in action plan")
        
        return {
            'score': max(0, score),
            'issues': issues,
            'recommendation': 'good' if score > 80 else 'review_required'
        }
    
    def check_safety_measures(self, task: AITask) -> Dict[str, Any]:
        """Check if AI has implemented proper safety measures"""
        score = 100.0
        issues = []
        
        # Check for confirmation requirements
        if task.requires_confirmation and not task.confirmation_prompt:
            score -= 30
            issues.append("Confirmation required but no prompt provided")
        
        # Check for data backup mentions
        has_backup = any('backup' in str(action).lower() or 'save' in str(action).lower() 
                        for action in task.planned_actions)
        if not has_backup and any('modify' in str(action).lower() for action in task.planned_actions):
            score -= 15
            issues.append("No backup strategy for data modifications")
        
        # Check for error handling
        has_error_handling = any('error' in str(action).lower() or 'catch' in str(action).lower() 
                               for action in task.planned_actions)
        if not has_error_handling:
            score -= 10
            issues.append("No error handling in action plan")
        
        return {
            'score': max(0, score),
            'issues': issues,
            'recommendation': 'good' if score > 80 else 'review_required'
        }
    
    def check_data_validation(self, task: AITask) -> Dict[str, Any]:
        """Check if AI is validating data properly"""
        score = 100.0
        issues = []
        
        # Check for email validation
        if 'email' in task.user_command.lower():
            has_email_validation = any('validate' in str(action).lower() or 'email' in str(action).lower() 
                                     for action in task.planned_actions)
            if not has_email_validation:
                score -= 20
                issues.append("Email operations without validation")
        
        # Check for required field validation
        if any('create' in str(action).lower() for action in task.planned_actions):
            has_required_validation = any('required' in str(action).lower() or 'mandatory' in str(action).lower() 
                                        for action in task.planned_actions)
            if not has_required_validation:
                score -= 15
                issues.append("Creation without required field validation")
        
        return {
            'score': max(0, score),
            'issues': issues,
            'recommendation': 'good' if score > 80 else 'review_required'
        }
    
    def check_permissions(self, task: AITask) -> Dict[str, Any]:
        """Check if AI is respecting permission boundaries"""
        score = 100.0
        issues = []
        
        # Check for admin-only operations
        admin_operations = ['delete', 'modify', 'create', 'send']
        user_command_lower = task.user_command.lower()
        
        for operation in admin_operations:
            if operation in user_command_lower:
                has_permission_check = any('admin' in str(action).lower() or 'permission' in str(action).lower() 
                                         for action in task.planned_actions)
                if not has_permission_check:
                    score -= 20
                    issues.append(f"Admin operation without permission check: {operation}")
        
        return {
            'score': max(0, score),
            'issues': issues,
            'recommendation': 'good' if score > 80 else 'review_required'
        }
    
    def evaluate_sanity(self, task: AITask) -> Dict[str, Any]:
        """Evaluate overall AI sanity for a task"""
        results = {}
        total_score = 0
        
        for check_name, check_func in self.sanity_checks.items():
            result = check_func(task)
            results[check_name] = result
            total_score += result['score']
        
        average_score = total_score / len(self.sanity_checks)
        
        # Determine sanity level
        if average_score >= 90:
            sanity_level = SanityLevel.EXCELLENT
        elif average_score >= 80:
            sanity_level = SanityLevel.GOOD
        elif average_score >= 70:
            sanity_level = SanityLevel.FAIR
        elif average_score >= 50:
            sanity_level = SanityLevel.POOR
        else:
            sanity_level = SanityLevel.CRITICAL
        
        # Collect all issues
        all_issues = []
        for result in results.values():
            all_issues.extend(result['issues'])
        
        return {
            'sanity_level': sanity_level,
            'sanity_score': average_score,
            'detailed_results': results,
            'all_issues': all_issues,
            'recommendation': 'proceed' if average_score >= 70 else 'review_required'
        }

class AITaskExecutor:
    """Executes AI tasks with monitoring and confirmation"""
    
    def __init__(self):
        self.sanity_monitor = AISanityMonitor()
        self.tasks: Dict[str, AITask] = {}
        self.simulation_mode = True  # Never actually execute, only simulate
    
    def create_task(self, user_command: str) -> AITask:
        """Create a new AI task from user command"""
        task_id = f"task_{int(time.time() * 1000)}"
        
        # AI interprets the command (simulated)
        ai_interpretation = self.interpret_command(user_command)
        
        # AI plans actions (simulated)
        planned_actions = self.plan_actions(user_command, ai_interpretation)
        
        # Create task
        task = AITask(
            id=task_id,
            user_command=user_command,
            ai_interpretation=ai_interpretation,
            planned_actions=planned_actions,
            current_step=0,
            status=TaskStatus.PENDING,
            sanity_level=SanityLevel.GOOD,
            sanity_score=100.0,
            execution_log=[],
            requires_confirmation=self.requires_confirmation(planned_actions),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Evaluate sanity
        sanity_result = self.sanity_monitor.evaluate_sanity(task)
        task.sanity_level = sanity_result['sanity_level']
        task.sanity_score = sanity_result['sanity_score']
        
        # Set confirmation prompt if needed
        if task.requires_confirmation:
            task.confirmation_prompt = self.generate_confirmation_prompt(task, sanity_result)
        
        self.tasks[task_id] = task
        return task
    
    def interpret_command(self, command: str) -> str:
        """AI interpretation of user command (simulated)"""
        command_lower = command.lower()
        
        if 'create campaign' in command_lower:
            return "User wants to create a new email marketing campaign. I need to gather campaign details, select templates, choose audience groups, and set up scheduling."
        
        elif 'send email' in command_lower:
            return "User wants to send emails. I need to identify the campaign, verify audience, check templates, and execute the send operation."
        
        elif 'manage audience' in command_lower:
            return "User wants to manage audience groups. I need to identify which groups to modify, what changes to make, and update the audience data."
        
        elif 'show analytics' in command_lower:
            return "User wants to view campaign analytics. I need to fetch performance data, format reports, and display metrics."
        
        else:
            return f"User command: '{command}'. I need to analyze this request and determine the appropriate actions to take."
    
    def plan_actions(self, command: str, interpretation: str) -> List[Dict[str, Any]]:
        """AI action planning (simulated)"""
        command_lower = command.lower()
        actions = []
        
        if 'create campaign' in command_lower:
            actions = [
                {"action": "validate_input", "description": "Validate campaign name and required fields"},
                {"action": "check_permissions", "description": "Verify user has admin permissions"},
                {"action": "create_campaign", "description": "Create new campaign in database"},
                {"action": "setup_templates", "description": "Configure email templates for campaign"},
                {"action": "configure_audience", "description": "Set up audience groups and targeting"},
                {"action": "schedule_campaign", "description": "Set up campaign scheduling and timing"},
                {"action": "confirm_creation", "description": "Confirm campaign was created successfully"}
            ]
        
        elif 'send email' in command_lower:
            actions = [
                {"action": "validate_campaign", "description": "Verify campaign exists and is ready"},
                {"action": "check_audience", "description": "Validate audience group has members"},
                {"action": "verify_templates", "description": "Ensure email templates are configured"},
                {"action": "preview_email", "description": "Generate email preview for review"},
                {"action": "confirm_send", "description": "Get user confirmation before sending"},
                {"action": "execute_send", "description": "Send emails to audience members"},
                {"action": "track_delivery", "description": "Monitor email delivery status"}
            ]
        
        elif 'manage audience' in command_lower:
            actions = [
                {"action": "list_audiences", "description": "Get list of existing audience groups"},
                {"action": "validate_changes", "description": "Validate requested audience modifications"},
                {"action": "backup_data", "description": "Create backup of current audience data"},
                {"action": "update_audience", "description": "Apply changes to audience groups"},
                {"action": "verify_changes", "description": "Confirm changes were applied correctly"}
            ]
        
        elif 'show analytics' in command_lower:
            actions = [
                {"action": "fetch_data", "description": "Retrieve campaign performance data"},
                {"action": "process_metrics", "description": "Calculate analytics metrics"},
                {"action": "generate_report", "description": "Create formatted analytics report"},
                {"action": "display_results", "description": "Present analytics to user"}
            ]
        
        else:
            actions = [
                {"action": "analyze_request", "description": "Analyze user request to understand requirements"},
                {"action": "determine_actions", "description": "Determine appropriate actions to take"},
                {"action": "execute_plan", "description": "Execute the determined action plan"}
            ]
        
        return actions
    
    def requires_confirmation(self, actions: List[Dict[str, Any]]) -> bool:
        """Determine if task requires user confirmation"""
        confirmation_triggers = [
            'send', 'create', 'delete', 'modify', 'update', 'execute'
        ]
        
        for action in actions:
            action_str = json.dumps(action).lower()
            for trigger in confirmation_triggers:
                if trigger in action_str:
                    return True
        
        return False
    
    def generate_confirmation_prompt(self, task: AITask, sanity_result: Dict[str, Any]) -> str:
        """Generate confirmation prompt for user"""
        prompt = f"\n🤖 AI TASK CONFIRMATION REQUIRED\n"
        prompt += f"{'='*50}\n"
        prompt += f"Command: {task.user_command}\n"
        prompt += f"Interpretation: {task.ai_interpretation}\n"
        prompt += f"Sanity Score: {task.sanity_score:.1f}/100 ({task.sanity_level.value})\n\n"
        
        if sanity_result['all_issues']:
            prompt += f"⚠️  WARNINGS:\n"
            for issue in sanity_result['all_issues']:
                prompt += f"   • {issue}\n"
            prompt += "\n"
        
        prompt += f"📋 PLANNED ACTIONS:\n"
        for i, action in enumerate(task.planned_actions, 1):
            prompt += f"   {i}. {action['description']}\n"
        
        prompt += f"\n❓ Do you want to proceed with these actions?\n"
        prompt += f"   Type 'yes' to confirm, 'no' to cancel, or 'modify' to change the plan.\n"
        
        return prompt
    
    def execute_task_step(self, task_id: str) -> Dict[str, Any]:
        """Execute the next step of a task"""
        if task_id not in self.tasks:
            return {"error": "Task not found"}
        
        task = self.tasks[task_id]
        
        if task.current_step >= len(task.planned_actions):
            task.status = TaskStatus.COMPLETED
            return {"status": "completed", "message": "All actions completed"}
        
        current_action = task.planned_actions[task.current_step]
        
        # Log the action
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "step": task.current_step + 1,
            "action": current_action,
            "status": "executing"
        }
        
        task.execution_log.append(log_entry)
        task.status = TaskStatus.EXECUTING
        
        # Simulate action execution
        result = self.simulate_action_execution(current_action, task)
        
        # Update log entry with result
        log_entry["result"] = result
        log_entry["status"] = "completed"
        
        task.current_step += 1
        task.updated_at = datetime.now()
        
        if task.current_step >= len(task.planned_actions):
            task.status = TaskStatus.COMPLETED
        else:
            task.status = TaskStatus.IN_PROGRESS
        
        return {
            "status": "step_completed",
            "step": task.current_step,
            "total_steps": len(task.planned_actions),
            "result": result,
            "next_action": task.planned_actions[task.current_step] if task.current_step < len(task.planned_actions) else None
        }
    
    def simulate_action_execution(self, action: Dict[str, Any], task: AITask) -> Dict[str, Any]:
        """Simulate execution of an action (never actually executes)"""
        action_type = action["action"]
        
        if action_type == "validate_input":
            return {
                "success": True,
                "message": "✅ Input validation passed",
                "details": "All required fields are present and valid"
            }
        
        elif action_type == "check_permissions":
            return {
                "success": True,
                "message": "✅ Permission check passed",
                "details": "User has admin permissions for this operation"
            }
        
        elif action_type == "create_campaign":
            return {
                "success": True,
                "message": "✅ Campaign created successfully (SIMULATED)",
                "details": "Campaign 'Test Campaign' created with ID: camp_12345",
                "simulation": True
            }
        
        elif action_type == "execute_send":
            return {
                "success": True,
                "message": "✅ Emails sent successfully (SIMULATED)",
                "details": "150 emails queued for delivery",
                "simulation": True,
                "warning": "SIMULATION MODE - No actual emails were sent"
            }
        
        elif action_type == "preview_email":
            return {
                "success": True,
                "message": "✅ Email preview generated",
                "details": "Preview shows professional email template with personalization"
            }
        
        else:
            return {
                "success": True,
                "message": f"✅ Action '{action_type}' completed (SIMULATED)",
                "details": f"Simulated execution of {action['description']}",
                "simulation": True
            }
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get current status of a task"""
        if task_id not in self.tasks:
            return {"error": "Task not found"}
        
        task = self.tasks[task_id]
        
        return {
            "task_id": task_id,
            "user_command": task.user_command,
            "ai_interpretation": task.ai_interpretation,
            "status": task.status.value,
            "sanity_level": task.sanity_level.value,
            "sanity_score": task.sanity_score,
            "current_step": task.current_step,
            "total_steps": len(task.planned_actions),
            "progress_percentage": (task.current_step / len(task.planned_actions)) * 100,
            "planned_actions": task.planned_actions,
            "execution_log": task.execution_log,
            "requires_confirmation": task.requires_confirmation,
            "confirmation_prompt": task.confirmation_prompt,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }

class AITestingInterface:
    """Interactive interface for testing AI capabilities"""
    
    def __init__(self):
        self.executor = AITaskExecutor()
        self.current_task: Optional[AITask] = None
    
    def start_interactive_session(self):
        """Start interactive testing session"""
        print("🤖 AI TESTING SYSTEM - INTERACTIVE SESSION")
        print("=" * 60)
        print("This system allows you to test AI capabilities safely.")
        print("All actions are SIMULATED - nothing will be sent or modified.")
        print("\nCommands:")
        print("  'test <command>' - Test AI with a command")
        print("  'status' - Show current task status")
        print("  'confirm' - Confirm current task execution")
        print("  'cancel' - Cancel current task")
        print("  'list' - List all tasks")
        print("  'quit' - Exit the testing system")
        print("=" * 60)
        
        while True:
            try:
                user_input = input("\n🧠 AI Testing > ").strip()
                
                if user_input.lower() == 'quit':
                    print("👋 Goodbye! Testing session ended.")
                    break
                
                elif user_input.lower() == 'status':
                    self.show_task_status()
                
                elif user_input.lower() == 'confirm':
                    self.confirm_current_task()
                
                elif user_input.lower() == 'cancel':
                    self.cancel_current_task()
                
                elif user_input.lower() == 'list':
                    self.list_all_tasks()
                
                elif user_input.lower().startswith('test '):
                    command = user_input[5:].strip()
                    self.test_ai_command(command)
                
                else:
                    print("❓ Unknown command. Type 'quit' to exit or 'test <command>' to test AI.")
            
            except KeyboardInterrupt:
                print("\n👋 Testing session interrupted. Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
    
    def test_ai_command(self, command: str):
        """Test AI with a user command"""
        print(f"\n🧪 Testing AI with command: '{command}'")
        print("-" * 50)
        
        # Create task
        self.current_task = self.executor.create_task(command)
        
        print(f"📋 Task ID: {self.current_task.id}")
        print(f"🧠 AI Interpretation: {self.current_task.ai_interpretation}")
        print(f"📊 Sanity Score: {self.current_task.sanity_score:.1f}/100 ({self.current_task.sanity_level.value})")
        
        # Show sanity issues if any
        sanity_result = self.executor.sanity_monitor.evaluate_sanity(self.current_task)
        if sanity_result['all_issues']:
            print(f"\n⚠️  SANITY WARNINGS:")
            for issue in sanity_result['all_issues']:
                print(f"   • {issue}")
        
        # Show planned actions
        print(f"\n📋 PLANNED ACTIONS:")
        for i, action in enumerate(self.current_task.planned_actions, 1):
            print(f"   {i}. {action['description']}")
        
        # Show confirmation prompt if needed
        if self.current_task.requires_confirmation:
            print(f"\n{self.current_task.confirmation_prompt}")
        else:
            print(f"\n✅ No confirmation required. Task ready to execute.")
            print(f"Type 'confirm' to start execution or 'cancel' to abort.")
    
    def show_task_status(self):
        """Show current task status"""
        if not self.current_task:
            print("❌ No active task. Use 'test <command>' to create a task.")
            return
        
        status = self.executor.get_task_status(self.current_task.id)
        
        print(f"\n📊 TASK STATUS")
        print("-" * 30)
        print(f"Task ID: {status['task_id']}")
        print(f"Command: {status['user_command']}")
        print(f"Status: {status['status']}")
        print(f"Sanity: {status['sanity_score']:.1f}/100 ({status['sanity_level']})")
        print(f"Progress: {status['progress_percentage']:.1f}% ({status['current_step']}/{status['total_steps']})")
        
        if status['execution_log']:
            print(f"\n📝 EXECUTION LOG:")
            for log_entry in status['execution_log']:
                print(f"   Step {log_entry['step']}: {log_entry['action']['description']}")
                print(f"      Status: {log_entry['status']}")
                if 'result' in log_entry:
                    print(f"      Result: {log_entry['result']['message']}")
    
    def confirm_current_task(self):
        """Confirm and execute current task"""
        if not self.current_task:
            print("❌ No active task to confirm.")
            return
        
        if self.current_task.status != TaskStatus.WAITING_CONFIRMATION and not self.current_task.requires_confirmation:
            print("❌ Current task doesn't require confirmation or is already in progress.")
            return
        
        print(f"\n🚀 EXECUTING TASK: {self.current_task.id}")
        print("-" * 50)
        
        self.current_task.status = TaskStatus.IN_PROGRESS
        
        # Execute all steps
        for step in range(len(self.current_task.planned_actions)):
            print(f"\n📋 Step {step + 1}/{len(self.current_task.planned_actions)}")
            
            result = self.executor.execute_task_step(self.current_task.id)
            
            if result.get("status") == "step_completed":
                action = self.current_task.planned_actions[step]
                print(f"   Action: {action['description']}")
                print(f"   Result: {result['result']['message']}")
                
                if result['result'].get('simulation'):
                    print(f"   ⚠️  SIMULATION MODE - No actual changes made")
                
                time.sleep(1)  # Simulate processing time
            else:
                print(f"   ❌ Step failed: {result}")
                break
        
        if self.current_task.status == TaskStatus.COMPLETED:
            print(f"\n✅ TASK COMPLETED SUCCESSFULLY!")
            print(f"All {len(self.current_task.planned_actions)} steps executed.")
        else:
            print(f"\n⚠️  Task status: {self.current_task.status.value}")
    
    def cancel_current_task(self):
        """Cancel current task"""
        if not self.current_task:
            print("❌ No active task to cancel.")
            return
        
        self.current_task.status = TaskStatus.CANCELLED
        print(f"❌ Task {self.current_task.id} cancelled.")
        self.current_task = None
    
    def list_all_tasks(self):
        """List all tasks"""
        if not self.executor.tasks:
            print("📋 No tasks created yet.")
            return
        
        print(f"\n📋 ALL TASKS ({len(self.executor.tasks)})")
        print("-" * 40)
        
        for task_id, task in self.executor.tasks.items():
            print(f"ID: {task_id}")
            print(f"Command: {task.user_command}")
            print(f"Status: {task.status.value}")
            print(f"Sanity: {task.sanity_score:.1f}/100")
            print(f"Created: {task.created_at.strftime('%H:%M:%S')}")
            print("-" * 40)

def main():
    """Main function to run the AI testing system"""
    interface = AITestingInterface()
    interface.start_interactive_session()

if __name__ == "__main__":
    main()
