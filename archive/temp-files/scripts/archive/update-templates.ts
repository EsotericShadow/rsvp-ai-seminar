#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTemplates() {
  console.log(' Rewriting email templates to remove false claims...\n');

  const templates = await prisma.campaignTemplate.findMany();

  for (const template of templates) {
    let newSubject = template.subject;
    let newHtmlBody = template.htmlBody;
    let newTextBody = template.textBody;

    // Remove problematic claims from subject
    newSubject = newSubject.replace(/How ABC Construction saved \$20,000 with AI tools/g, 'Discover the Potential of AI for Your Business');

    // Remove problematic claims from HTML body
    newHtmlBody = newHtmlBody.replace(/A local restaurant reduced food waste by 30% using predictive ordering/g, 'Learn how AI can help reduce waste and optimize ordering');
    newHtmlBody = newHtmlBody.replace(/A construction company cut material costs by 15% with better inventory management/g, 'Discover how AI can improve inventory management and cut material costs');
    newHtmlBody = newHtmlBody.replace(/A retail store increased customer engagement by 40% with automated follow-ups/g, 'See how AI-powered automated follow-ups can increase customer engagement');
    newHtmlBody = newHtmlBody.replace(/We're saving about 8 hours per week on data entry alone./g, 'Learn how to save hours on data entry');
    newHtmlBody = newHtmlBody.replace(/The inventory prediction tool has been a game-changer. We're ordering exactly what we need, when we need it./g, 'Discover how AI-powered inventory prediction can be a game-changer');
    newHtmlBody = newHtmlBody.replace(/Manual inventory tracking was costing them \$2,000\+ per month in over-ordering and waste./g, 'Manual inventory tracking can be costly due to over-ordering and waste.');
    newHtmlBody = newHtmlBody.replace(/30% reduction in material waste/g, 'Significant reduction in material waste');
    newHtmlBody = newHtmlBody.replace(/\$20,000 annual savings/g, 'Substantial annual savings');
    newHtmlBody = newHtmlBody.replace(/15 hours per week saved on inventory management/g, 'Many hours per week saved on inventory management');
    newHtmlBody = newHtmlBody.replace(/Average time savings: 6-12 hours per week/g, 'Potential for significant time savings');
    newHtmlBody = newHtmlBody.replace(/Cost reduction: 10-20% on routine operations/g, 'Potential for cost reduction on routine operations');
    newHtmlBody = newHtmlBody.replace(/Error reduction: 85% fewer data entry mistakes/g, 'Fewer data entry mistakes');
    newHtmlBody = newHtmlBody.replace(/Customer response time: 70% faster follow-ups/g, 'Faster customer follow-ups');

    // Remove problematic claims from text body
    newTextBody = newTextBody.replace(/A local restaurant reduced food waste by 30% using predictive ordering/g, 'Learn how AI can help reduce waste and optimize ordering');
    newTextBody = newTextBody.replace(/A construction company cut material costs by 15% with better inventory management/g, 'Discover how AI can improve inventory management and cut material costs');
    newTextBody = newTextBody.replace(/A retail store increased customer engagement by 40% with automated follow-ups/g, 'See how AI-powered automated follow-ups can increase customer engagement');
    newTextBody = newTextBody.replace(/We're saving about 8 hours per week on data entry alone./g, 'Learn how to save hours on data entry');
    newTextBody = newTextBody.replace(/The inventory prediction tool has been a game-changer. We're ordering exactly what we need, when we need it./g, 'Discover how AI-powered inventory prediction can be a game-changer');
    newTextBody = newTextBody.replace(/Manual inventory tracking was costing them \$2,000\+ per month in over-ordering and waste./g, 'Manual inventory tracking can be costly due to over-ordering and waste.');
    newTextBody = newTextBody.replace(/30% reduction in material waste/g, 'Significant reduction in material waste');
    newTextBody = newTextBody.replace(/\$20,000 annual savings/g, 'Substantial annual savings');
    newTextBody = newTextBody.replace(/15 hours per week saved on inventory management/g, 'Many hours per week saved on inventory management');
    newTextBody = newTextBody.replace(/Average time savings: 6-12 hours per week/g, 'Potential for significant time savings');
    newTextBody = newTextBody.replace(/Cost reduction: 10-20% on routine operations/g, 'Potential for cost reduction on routine operations');
    newTextBody = newTextBody.replace(/Error reduction: 85% fewer data entry mistakes/g, 'Fewer data entry mistakes');
    newTextBody = newTextBody.replace(/Customer response time: 70% faster follow-ups/g, 'Faster customer follow-ups');

    await prisma.campaignTemplate.update({
      where: { id: template.id },
      data: {
        subject: newSubject,
        htmlBody: newHtmlBody,
        textBody: newTextBody,
      },
    });

    console.log(`--- UPDATED TEMPLATE: ${template.name} ---`);
  }
}

updateTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
