#!/usr/bin/env python3
"""
Comprehensive Training Data Vectorization System
Converts all training data into properly labeled, explained, and vectorized format for RAG
"""

import json
import os
import re
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from pathlib import Path

@dataclass
class VectorizedTrainingExample:
    """Structured training example with proper labeling and explanations"""
    id: str
    category: str
    subcategory: str
    title: str
    description: str
    code_snippets: List[Dict[str, str]]
    processes: List[Dict[str, str]]
    interconnections: List[str]
    usage_examples: List[str]
    troubleshooting: List[str]
    related_apis: List[str]
    related_components: List[str]
    tags: List[str]
    complexity_level: str
    evergreen_brand_context: Dict[str, Any]

class TrainingDataVectorizer:
    def __init__(self, training_data_dir: str = "training-data"):
        self.training_data_dir = Path(training_data_dir)
        self.vectorized_data = []
        self.category_mapping = {
            "01-campaign-creation-accurate.jsonl": "Campaign Management",
            "02-campaign-listing-accurate.jsonl": "Campaign Management", 
            "03-campaign-updates-accurate.jsonl": "Campaign Management",
            "04-campaign-status-accurate.jsonl": "Campaign Management",
            "05-template-creation-accurate.jsonl": "Email Template Management",
            "06-template-management-accurate.jsonl": "Email Template Management",
            "07-global-template-system-accurate.jsonl": "Global Template System",
            "08-email-sending-system-accurate.jsonl": "Email Sending System",
            "09-complete-email-system-accurate.jsonl": "Complete Email System",
            "10-rsvp-data-management-accurate.jsonl": "RSVP Data Management",
            "11-analytics-tracking-system-accurate.jsonl": "Analytics & Tracking",
            "12-security-features-accurate.jsonl": "Security Features",
            "13-admin-authentication-accurate.jsonl": "Admin Authentication",
            "14-audience-management-accurate.jsonl": "Audience Management",
            "15-leadmine-integration-accurate.jsonl": "LeadMine Integration",
            "16-webhook-handling-accurate.jsonl": "Webhook Handling",
            "17-privacy-compliance-accurate.jsonl": "Privacy & Compliance",
            "18-event-management-accurate.jsonl": "Event Management",
            "19-form-validation-accurate.jsonl": "Form Validation",
            "20-middleware-features-accurate.jsonl": "Middleware Features"
        }
        
    def extract_code_snippets(self, text: str) -> List[Dict[str, str]]:
        """Extract and categorize code snippets from training text"""
        code_snippets = []
        
        # Find TypeScript/JavaScript code blocks
        ts_pattern = r'```typescript\n(.*?)\n```'
        js_pattern = r'```javascript\n(.*?)\n```'
        generic_pattern = r'```\n(.*?)\n```'
        
        for pattern, language in [(ts_pattern, "typescript"), (js_pattern, "javascript"), (generic_pattern, "code")]:
            matches = re.findall(pattern, text, re.DOTALL)
            for i, match in enumerate(matches):
                code_snippets.append({
                    "language": language,
                    "code": match.strip(),
                    "context": f"Code snippet {i+1}",
                    "purpose": self._infer_code_purpose(match.strip())
                })
        
        return code_snippets
    
    def _infer_code_purpose(self, code: str) -> str:
        """Infer the purpose of code snippet"""
        code_lower = code.lower()
        
        if "export async function" in code_lower:
            return "API endpoint handler"
        elif "export default function" in code_lower:
            return "React component"
        elif "model " in code_lower and "{" in code_lower:
            return "Database schema model"
        elif "import" in code_lower and "from" in code_lower:
            return "Module import/export"
        elif "const " in code_lower and "=" in code_lower:
            return "Configuration or constant definition"
        elif "if (" in code_lower or "for (" in code_lower:
            return "Control flow logic"
        elif "try {" in code_lower:
            return "Error handling"
        elif "await " in code_lower:
            return "Async operation"
        else:
            return "General code implementation"
    
    def extract_processes(self, text: str) -> List[Dict[str, str]]:
        """Extract process descriptions from training text"""
        processes = []
        
        # Look for numbered lists or bullet points describing processes
        process_patterns = [
            r'(\d+\.\s+[^\n]+(?:\n(?!\d+\.)[^\n]+)*)',
            r'(\*\s+[^\n]+(?:\n(?!\*)[^\n]+)*)',
            r'(-\s+[^\n]+(?:\n(?!-)[^\n]+)*)'
        ]
        
        for pattern in process_patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            for match in matches:
                process_text = match.strip()
                if len(process_text) > 20:  # Filter out short matches
                    processes.append({
                        "description": process_text,
                        "type": "step" if re.match(r'\d+\.', process_text) else "item",
                        "category": self._categorize_process(process_text)
                    })
        
        return processes
    
    def _categorize_process(self, process_text: str) -> str:
        """Categorize process type"""
        text_lower = process_text.lower()
        
        if any(word in text_lower for word in ["validate", "check", "verify"]):
            return "validation"
        elif any(word in text_lower for word in ["create", "add", "insert"]):
            return "creation"
        elif any(word in text_lower for word in ["update", "modify", "change"]):
            return "modification"
        elif any(word in text_lower for word in ["delete", "remove", "destroy"]):
            return "deletion"
        elif any(word in text_lower for word in ["fetch", "get", "retrieve"]):
            return "retrieval"
        elif any(word in text_lower for word in ["send", "post", "submit"]):
            return "transmission"
        else:
            return "general"
    
    def extract_interconnections(self, text: str, category: str) -> List[str]:
        """Extract how this component connects to others"""
        interconnections = []
        
        # Common interconnection patterns
        connection_patterns = [
            r"uses (.+?) from",
            r"imports (.+?) from", 
            r"calls (.+?) function",
            r"integrates with (.+?)",
            r"connects to (.+?)",
            r"depends on (.+?)",
            r"works with (.+?)"
        ]
        
        for pattern in connection_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if match not in interconnections:
                    interconnections.append(match.strip())
        
        # Add category-specific interconnections
        category_connections = {
            "Campaign Management": ["Email Template Management", "Audience Management", "Email Sending System"],
            "Email Template Management": ["Global Template System", "Campaign Management"],
            "Global Template System": ["Email Template Management", "Email Sending System"],
            "Email Sending System": ["Resend API", "SendGrid API", "Campaign Management"],
            "RSVP Data Management": ["Form Validation", "Analytics & Tracking", "Event Management"],
            "Analytics & Tracking": ["Middleware Features", "RSVP Data Management"],
            "Security Features": ["Admin Authentication", "Form Validation", "Middleware Features"],
            "Admin Authentication": ["Security Features", "Middleware Features"],
            "Audience Management": ["LeadMine Integration", "Campaign Management"],
            "LeadMine Integration": ["Audience Management", "Webhook Handling"],
            "Webhook Handling": ["SendGrid API", "LeadMine Integration", "Email Sending System"],
            "Privacy & Compliance": ["Form Validation", "Analytics & Tracking", "Security Features"],
            "Event Management": ["RSVP Data Management", "Email Sending System"],
            "Form Validation": ["Security Features", "RSVP Data Management"],
            "Middleware Features": ["Security Features", "Analytics & Tracking", "Admin Authentication"]
        }
        
        if category in category_connections:
            interconnections.extend(category_connections[category])
        
        return list(set(interconnections))  # Remove duplicates
    
    def extract_usage_examples(self, text: str) -> List[str]:
        """Extract usage examples from training text"""
        examples = []
        
        # Look for example patterns
        example_patterns = [
            r'Example usage:\s*\n(.*?)(?=\n\n|\n[A-Z]|$)',
            r'Usage example:\s*\n(.*?)(?=\n\n|\n[A-Z]|$)',
            r'For example:\s*(.*?)(?=\n\n|\n[A-Z]|$)',
            r'Example:\s*(.*?)(?=\n\n|\n[A-Z]|$)'
        ]
        
        for pattern in example_patterns:
            matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            for match in matches:
                examples.append(match.strip())
        
        return examples
    
    def extract_troubleshooting(self, text: str) -> List[str]:
        """Extract troubleshooting information"""
        troubleshooting = []
        
        # Look for error patterns and solutions
        error_patterns = [
            r'Error:\s*(.*?)(?=\n\n|\n[A-Z]|$)',
            r'Issue:\s*(.*?)(?=\n\n|\n[A-Z]|$)',
            r'Problem:\s*(.*?)(?=\n\n|\n[A-Z]|$)',
            r'Solution:\s*(.*?)(?=\n\n|\n[A-Z]|$)',
            r'Fix:\s*(.*?)(?=\n\n|\n[A-Z]|$)'
        ]
        
        for pattern in error_patterns:
            matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            for match in matches:
                troubleshooting.append(match.strip())
        
        return troubleshooting
    
    def extract_related_apis(self, text: str) -> List[str]:
        """Extract related API endpoints"""
        apis = []
        
        # Look for API endpoint patterns
        api_patterns = [
            r'/api/[^\s]+',
            r'POST\s+/api/[^\s]+',
            r'GET\s+/api/[^\s]+',
            r'PUT\s+/api/[^\s]+',
            r'DELETE\s+/api/[^\s]+'
        ]
        
        for pattern in api_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if match not in apis:
                    apis.append(match.strip())
        
        return apis
    
    def extract_related_components(self, text: str) -> List[str]:
        """Extract related React components and files"""
        components = []
        
        # Look for component and file references
        component_patterns = [
            r'([A-Z][a-zA-Z]+\.tsx?)',
            r'([a-zA-Z]+\.ts)',
            r'([a-zA-Z]+\.js)',
            r'src/[^\s]+',
            r'components/[^\s]+'
        ]
        
        for pattern in component_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if match not in components and len(match) > 3:
                    components.append(match.strip())
        
        return components
    
    def generate_tags(self, text: str, category: str) -> List[str]:
        """Generate relevant tags for the training example"""
        tags = [category.lower().replace(" ", "-")]
        
        # Extract technology tags
        tech_keywords = {
            "typescript": ["typescript", "ts", ".ts", ".tsx"],
            "react": ["react", "component", "jsx", "useState", "useEffect"],
            "nextjs": ["next.js", "nextjs", "app router", "api route"],
            "prisma": ["prisma", "database", "model", "schema"],
            "zod": ["zod", "validation", "schema"],
            "tailwind": ["tailwind", "css", "className"],
            "resend": ["resend", "email", "send"],
            "sendgrid": ["sendgrid", "email", "webhook"],
            "weaviate": ["weaviate", "vector", "rag"],
            "security": ["security", "csrf", "rate limit", "validation"],
            "authentication": ["auth", "login", "session", "jwt"],
            "analytics": ["analytics", "tracking", "visitor", "session"]
        }
        
        text_lower = text.lower()
        for tech, keywords in tech_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                tags.append(tech)
        
        return list(set(tags))
    
    def determine_complexity_level(self, text: str) -> str:
        """Determine complexity level of the training example"""
        text_lower = text.lower()
        
        # Count complexity indicators
        complexity_indicators = {
            "simple": ["basic", "simple", "straightforward", "easy"],
            "intermediate": ["moderate", "intermediate", "standard", "common"],
            "advanced": ["complex", "advanced", "sophisticated", "intricate", "comprehensive"]
        }
        
        # Count code blocks
        code_block_count = len(re.findall(r'```', text))
        
        # Count API endpoints
        api_count = len(re.findall(r'/api/', text))
        
        # Determine complexity
        if code_block_count > 10 or api_count > 5 or any(word in text_lower for word in complexity_indicators["advanced"]):
            return "advanced"
        elif code_block_count > 5 or api_count > 2 or any(word in text_lower for word in complexity_indicators["intermediate"]):
            return "intermediate"
        else:
            return "simple"
    
    def extract_evergreen_brand_context(self, text: str) -> Dict[str, Any]:
        """Extract Evergreen-specific brand context and business logic"""
        brand_context = {
            "company": "Evergreen Web Solutions",
            "owner": "Gabriel Lacroix",
            "location": "Terrace, BC, Canada",
            "business_focus": "AI automation and web solutions for Northern BC businesses",
            "target_audience": "Northern BC businesses",
            "services": ["AI implementation", "Web development", "Business automation"],
            "event_context": "AI in Northern BC: Information Session",
            "venue": "Sunshine Inn Terrace — Jasmine Room",
            "event_date": "October 23, 2025"
        }
        
        # Extract business-specific context from text
        if "northern bc" in text.lower():
            brand_context["regional_focus"] = "Northern BC"
        if "ai" in text.lower():
            brand_context["technology_focus"] = "AI and automation"
        if "business" in text.lower():
            brand_context["target_market"] = "Businesses"
        
        return brand_context
    
    def vectorize_training_file(self, file_path: Path) -> List[VectorizedTrainingExample]:
        """Vectorize a single training file"""
        vectorized_examples = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    if line.strip():
                        try:
                            data = json.loads(line.strip())
                            
                            # Extract basic information
                            instruction = data.get('instruction', '')
                            input_text = data.get('input', '')
                            output = data.get('output', '')
                            
                            # Combine all text for analysis
                            full_text = f"{instruction}\n{input_text}\n{output}"
                            
                            # Determine category
                            category = self.category_mapping.get(file_path.name, "General")
                            
                            # Create vectorized example
                            example = VectorizedTrainingExample(
                                id=f"{file_path.stem}_{line_num}",
                                category=category,
                                subcategory=self._determine_subcategory(instruction, category),
                                title=self._generate_title(instruction),
                                description=self._generate_description(instruction, input_text),
                                code_snippets=self.extract_code_snippets(full_text),
                                processes=self.extract_processes(full_text),
                                interconnections=self.extract_interconnections(full_text, category),
                                usage_examples=self.extract_usage_examples(full_text),
                                troubleshooting=self.extract_troubleshooting(full_text),
                                related_apis=self.extract_related_apis(full_text),
                                related_components=self.extract_related_components(full_text),
                                tags=self.generate_tags(full_text, category),
                                complexity_level=self.determine_complexity_level(full_text),
                                evergreen_brand_context=self.extract_evergreen_brand_context(full_text)
                            )
                            
                            vectorized_examples.append(example)
                            
                        except json.JSONDecodeError as e:
                            print(f"Error parsing JSON in {file_path}:{line_num} - {e}")
                            continue
                            
        except FileNotFoundError:
            print(f"File not found: {file_path}")
            
        return vectorized_examples
    
    def _determine_subcategory(self, instruction: str, category: str) -> str:
        """Determine subcategory based on instruction"""
        instruction_lower = instruction.lower()
        
        subcategory_mapping = {
            "Campaign Management": {
                "create": "Campaign Creation",
                "list": "Campaign Listing", 
                "update": "Campaign Updates",
                "status": "Campaign Status"
            },
            "Email Template Management": {
                "template": "Template Management",
                "create": "Template Creation"
            },
            "Security Features": {
                "csrf": "CSRF Protection",
                "rate": "Rate Limiting",
                "validation": "Input Validation"
            },
            "Admin Authentication": {
                "login": "Login System",
                "session": "Session Management",
                "auth": "Authentication"
            }
        }
        
        if category in subcategory_mapping:
            for keyword, subcategory in subcategory_mapping[category].items():
                if keyword in instruction_lower:
                    return subcategory
        
        return "General"
    
    def _generate_title(self, instruction: str) -> str:
        """Generate a concise title from instruction"""
        # Remove common prefixes and clean up
        title = instruction.replace("How does ", "").replace(" work?", "").replace("?", "")
        title = title.replace("Explain ", "").replace("What is ", "")
        
        # Capitalize and clean
        title = title.strip().capitalize()
        
        return title if title else "Training Example"
    
    def _generate_description(self, instruction: str, input_text: str) -> str:
        """Generate a description combining instruction and input"""
        description = instruction
        if input_text and input_text != instruction:
            description += f" - {input_text}"
        
        return description.strip()
    
    def vectorize_all_training_data(self) -> List[VectorizedTrainingExample]:
        """Vectorize all training data files"""
        all_vectorized = []
        
        # Find all training data files
        training_files = list(self.training_data_dir.glob("*accurate.jsonl"))
        
        print(f"Found {len(training_files)} training data files to vectorize...")
        
        for file_path in training_files:
            print(f"Vectorizing {file_path.name}...")
            vectorized = self.vectorize_training_file(file_path)
            all_vectorized.extend(vectorized)
            print(f"  - Vectorized {len(vectorized)} examples")
        
        print(f"Total vectorized examples: {len(all_vectorized)}")
        return all_vectorized
    
    def save_vectorized_data(self, vectorized_examples: List[VectorizedTrainingExample], output_file: str = "vectorized-training-data.json"):
        """Save vectorized data to JSON file"""
        output_path = self.training_data_dir / output_file
        
        # Convert to dictionary format
        data = []
        for example in vectorized_examples:
            data.append({
                "id": example.id,
                "category": example.category,
                "subcategory": example.subcategory,
                "title": example.title,
                "description": example.description,
                "code_snippets": example.code_snippets,
                "processes": example.processes,
                "interconnections": example.interconnections,
                "usage_examples": example.usage_examples,
                "troubleshooting": example.troubleshooting,
                "related_apis": example.related_apis,
                "related_components": example.related_components,
                "tags": example.tags,
                "complexity_level": example.complexity_level,
                "evergreen_brand_context": example.evergreen_brand_context
            })
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Vectorized data saved to {output_path}")
        return output_path

def main():
    """Main function to run the vectorization process"""
    vectorizer = TrainingDataVectorizer()
    
    print("Starting training data vectorization...")
    vectorized_examples = vectorizer.vectorize_all_training_data()
    
    print("Saving vectorized data...")
    output_file = vectorizer.save_vectorized_data(vectorized_examples)
    
    print(f"Vectorization complete! Generated {len(vectorized_examples)} vectorized examples.")
    print(f"Output saved to: {output_file}")
    
    # Print summary statistics
    categories = {}
    complexity_levels = {}
    
    for example in vectorized_examples:
        categories[example.category] = categories.get(example.category, 0) + 1
        complexity_levels[example.complexity_level] = complexity_levels.get(example.complexity_level, 0) + 1
    
    print("\nSummary Statistics:")
    print("Categories:")
    for category, count in categories.items():
        print(f"  - {category}: {count} examples")
    
    print("\nComplexity Levels:")
    for level, count in complexity_levels.items():
        print(f"  - {level}: {count} examples")

if __name__ == "__main__":
    main()

