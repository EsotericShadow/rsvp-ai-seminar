# RSVP System Training Data Generation Context

## Purpose
Create accurate, codebase-specific training data for fine-tuning Qwen2.5-3B to understand and work with the actual RSVP system architecture, API endpoints, database schema, and workflows.

## Current Status
- ✅ Base model downloaded and tested
- ✅ Initial generic training data created (157 examples)
- ✅ Fine-tuning completed but accuracy is poor (1/10)
- ❌ Model generates generic email marketing instead of RSVP-specific content
- 🔄 Creating codebase-accurate training data manually

## Key Problem
The model learned generic email marketing patterns instead of the specific RSVP system architecture. Need to create training examples that match the actual:
- API endpoints (`/api/admin/campaign/campaigns`, `/api/admin/campaign/schedules`, etc.)
- Database schema (Campaign, CampaignTemplate, AudienceGroup, RSVP models)
- Workflow patterns (campaign steps, RSVP processing, event management)
- Field names and data structures from the actual codebase

## Approach
1. **Manual Creation**: Not programmatic - manually examine codebase and create precise examples
2. **Incremental Building**: Stack on existing work, don't replace
3. **Categorical Organization**: Break down into manageable chunks
4. **Codebase Accuracy**: Use real API calls, real field names, real data structures
5. **Progressive Enhancement**: Build robust examples for each category

## Success Criteria
- Model should generate responses that match actual API endpoints
- Model should understand real database schema and field names
- Model should provide RSVP-specific guidance, not generic email marketing
- Model should reference actual codebase patterns and workflows


