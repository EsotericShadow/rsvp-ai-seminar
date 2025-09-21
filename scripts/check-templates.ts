#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTemplates() {
  console.log('Checking all email templates for problematic claims...\n');

  const templates = await prisma.campaignTemplate.findMany();

  const problematicClaims = [
    'How ABC Construction saved $20,000 with AI tools',
    'A local restaurant reduced food waste by 30% using predictive ordering',
    'A construction company cut material costs by 15% with better inventory management',
    'A retail store increased customer engagement by 40% with automated follow-ups',
    'We\'re saving about 8 hours per week on data entry alone.',
    'The inventory prediction tool has been a game-changer. We\'re ordering exactly what we need, when we need it.',
    'Manual inventory tracking was costing them $2,000+ per month in over-ordering and waste.',
    '30% reduction in material waste',
    '$20,000 annual savings',
    '15 hours per week saved on inventory management',
    'Average time savings: 6-12 hours per week',
    'Cost reduction: 10-20% on routine operations',
    'Error reduction: 85% fewer data entry mistakes',
    'Customer response time: 70% faster follow-ups',
  ];

  for (const template of templates) {
    let foundProblem = false;
    for (const claim of problematicClaims) {
      if (template.subject.includes(claim) || template.htmlBody.includes(claim)) {
        foundProblem = true;
        break;
      }
    }
    if (foundProblem) {
      console.log(`Problematic template: ${template.name}`);
    }
  }
}

checkTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
