#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewTemplates() {
  console.log('📧 Fetching all email templates...\n');

  const templates = await prisma.campaignTemplate.findMany();

  if (!templates.length) {
    console.error('❌ No templates found!');
    return;
  }

  for (const template of templates) {
    console.log(`--- TEMPLATE: ${template.name} ---`);
    console.log(`Subject: ${template.subject}`);
    console.log('--- HTML BODY ---');
    console.log(template.htmlBody);
    console.log('--- TEXT BODY ---');
    console.log(template.textBody);
    console.log(`--- END TEMPLATE: ${template.name} ---\n`);
  }
}

viewTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
