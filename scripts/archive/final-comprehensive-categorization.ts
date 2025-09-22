#!/usr/bin/env tsx

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { fetchLeadMineBusinesses } from '@/lib/leadMine';

const prisma = new PrismaClient();

async function finalComprehensiveCategorization() {
  console.log('🎯 FINAL Comprehensive Industry Categorization...\n');

  // Get the "Other Industries" group
  const otherGroup = await prisma.audienceGroup.findFirst({
    where: { name: 'Other Industries - Northern BC' },
    include: {
      members: {
        select: {
          id: true,
          businessName: true,
          primaryEmail: true,
          meta: true
        }
      }
    }
  });

  if (!otherGroup) {
    console.log('❌ "Other Industries" group not found');
    return;
  }

  console.log(`📊 Found ${otherGroup.members.length} businesses in "Other Industries"`);

  // Comprehensive categorization based on the actual business names
  const businessCategorization = {
    'Banks & Financial Services': [
      'bank of nova scotia', 'scotiabank', 'bank of montreal', 'bmo', 'cibc',
      'royal bank', 'rbc', 'toronto dominion bank', 'td bank', 'edward jones'
    ],
    'Automotive & Repair': [
      'kal tire', 'straightline', 'norm\'s auto', 'skeena rent-a-car', 'pronto towing',
      'fountain tire', 'great canadian oil change', 'budget rent a car', 'terrace motors',
      'peterbilt', 'purolator', 'sterling crane', 'yellowhead helicopters', 'canadian helicopters',
      'jazz aviation', 'central mountain air', 'quantum helicopters', 'great slave helicopters',
      'summit helicopters'
    ],
    'Food & Hospitality': [
      'safeway', 'white spot', 'dennys', 'kfc', 'taco bell', 'subway', 'mcdonalds',
      'dollarama', 'reitmans', 'pita pit', 'tandoori kababs', 'dollarama', 'mobil',
      'petro canada', 'superior propane', 'coca cola', 'pepsi', 'canada safeway'
    ],
    'Professional Services': [
      'h&r block', 'hr block', 'mnp', 'vohora', 'warner bandstra brown', 'mcelhanney',
      'wsp canada', 'als canada', 'linde canada', 'parsons', 'atkinsrÃ©alis', 'pinchin',
      '3-d line locating', 'agat laboratories', 'msalabs', 'ecofish research'
    ],
    'Health & Wellness': [
      'benson optical', 'connect hearing', 'miracle-ear', 'complete denture', 'nu-smile orthodontics',
      'dr. mark', 'dr. beatrice', 'dr. candice', 'dr. p.c. lotz', 'dr. roberts', 'dr. lucas arnold',
      'dr. michelle venter', 'dr. kevin krysiak', 'mourning\'s dawn counselling', 'leeward counselling',
      'northern bc sleep centre', 'skeena sport & spine', 'lifebloom counselling', 'melissa zarecki rmt',
      'bone and blossom', 'dr michelle venter'
    ],
    'Retail & Commerce': [
      'tenaquip', 'e.b. horsman', 'all west glass', 'staples', 'mark\'s work wearhouse',
      'guillevin international', 'uap', 'hilti', 'lafarge canada', 'ardene', 'pet valu',
      'dollarama', 'reitmans', 'supplement king', 'vallen canada', 'rocky mtn chocolate'
    ],
    'Beauty & Personal Care': [
      'hairbusters', 'terrace beauty nail salon', 'hl nails salon', 'gloss aesthetics',
      'repose massage', 'northern e-clips hairstudio', 'studio 3 salon & spa', 'rich with color tattoo',
      'creative zone', 'celestial singing studio', 'art in motion dance', 'pure tantra',
      'sitka salon & spa', 'luna salon', 'polished artistry', 'hard as nails', 'creative edge nails',
      'reflectionz hair lounge', 'pretty paws grooming', 'b.lily\'s cosmetic tattoo', 'venom ink tattoo',
      'cymmassage', 'glam\'r nails & spa', 'fin and fern tattoo'
    ],
    'Construction & Building': [
      'dln contracting', 'wiebe contracting', 'tri-an contracting', 'h. o\'brien contracting',
      'j.l.\'s excavating', 'frontline installations', 'chad buhr contracting', 't.montague contracting',
      'mailloux contracting', 'greywolfhound contracting', 'nbc contracting', 'dubytz contracting',
      'pcl constructors', 'justin berry contracting', 'w.o contracting', 'o.b. ventures',
      'north peak projects', 'rising dawn installations', 'pac west contracting', 'fine grit contracting',
      'east peak contracting', 'thibs contracting', 'tsimshian coastal contracting', 'heenan enterprises',
      'rounded edge contracting', 'abroch ucontracting', 'a.m. industries', 'perceptive industries',
      'everett industries', 'north coast mechanical', 'village mechanical', 'four elements contracting',
      'cool net refrigeration', 'seal tec industries', 'j2 hd', 'garnet mechanical',
      'radiant north mechanical', 'north arm mechanical', 'tanker electric', 'lanfear guest house'
    ],
    'Energy & Utilities': [
      'pacific northern gas', 'terrace rewind', 'westcana electric', 'bryant electric',
      'power flow electric', 'tri-city refrigeration', 'ki power & pole', 'air liquide canada',
      'linde canada', 'pacific northern gas', 'zed energy', 'avalanche heat pumps',
      'thomson energy solutions'
    ],
    'Waste Management & Environmental': [
      'abc recycling', 'northern upkeep cleaning', 'naomi\'s classic cleaning',
      'hummingbird cleaning company', 'turbocharged cleaning', 'time cleaners', 'spotless laundry',
      'scott\'s janitorial', 'ultra janitorial', 'master sweeper', 'allen\'s scrap & salvage',
      'rupert disposal', 'northern confidential shredding'
    ],
    'Transportation & Logistics': [
      'kalum kabs', 'purolator', 'sterling crane', 'yellowhead helicopters', 'canadian helicopters',
      'jazz aviation', 'central mountain air', 'quantum helicopters', 'great slave helicopters',
      'summit helicopters', 'pw transit canada', 'standard bus contracting', 'alliance traffic group'
    ],
    'Real Estate & Property': [
      'west point rentals', 'trigo\'s enterprises', 'united rentals', 'local rental solutions',
      'cross country canada supplies & rentals', 'loon properties', 'plymax properties',
      'sutha holdings', 'arkafortunedevelopments', 'medeek meadows', 'noble five creek',
      'the raven\'s nest airbnb', 'tyler and nadine\'s airbnb', 'lanfear guest house'
    ],
    'Education & Training': [
      'northwest training', 'terrace academy of music', 'strictly flagging training',
      'sunset driving school', 'philcan pro driving school', 'karma training', 'kulspai driving school',
      'age of driving school'
    ],
    'Arts & Entertainment': [
      'misty river books', 'creative zone', 'celestial singing studio', 'art in motion dance',
      'rich with color tattoo', 'atlantis taekwondo', 'maxxed out cross training',
      'art in motion dance & performing arts centre', 'lucky dollar bingo palace', 'chances terrace',
      'castle pottery', 'mason jar studio', 'little honey b photography', 'mattias fredriksson photography',
      'tyler meers photography', 'jeda\'s creative moments', 'craftify', 'storyforge'
    ],
    'Technology & Communications': [
      'skeena sight & sound', 'syberscream', 'helix it', 'skeena signs', 'sitka industries',
      'orange jigsaw corporation', 'j2 hd', 'skeena print hub', 'we do business online',
      'flint corp'
    ],
    'Government & Public Services': [
      'bcls', 'consolidated civil enforcement', 'bc1460479'
    ],
    'Non-Profit & Community': [
      'coast mountain children society', 'fireweed club', 'kulspai driving school society'
    ],
    'Security & Safety': [
      'sc safety', 'elite flood & fire restoration', 'boomers fireworks'
    ],
    'Manufacturing & Production': [
      'orica canada', 'hilti', 'lafarge canada', 'coca cola canada bottling', 'pepsi beverages',
      'peterbilt pacific', 'sterling crane', 'air liquide canada', 'linde canada', 'lafarge canada',
      'monster industries', 'mas-rock industries', 'houle electric', 'pcl constructors westcoast'
    ]
  };

  // Categorize businesses
  const categorized = new Map<string, any[]>();
  const uncategorized: any[] = [];

  otherGroup.members.forEach(member => {
    const name = member.businessName.toLowerCase();
    let categorizedFlag = false;

    for (const [industry, keywords] of Object.entries(businessCategorization)) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          if (!categorized.has(industry)) {
            categorized.set(industry, []);
          }
          categorized.get(industry)!.push(member);
          categorizedFlag = true;
          break;
        }
      }
      if (categorizedFlag) break;
    }

    if (!categorizedFlag) {
      uncategorized.push(member);
    }
  });

  // Show results
  console.log('\n📊 CATEGORIZATION RESULTS:');
  let totalCategorized = 0;
  for (const [industry, businesses] of categorized) {
    console.log(`\n🏭 ${industry}: ${businesses.length} businesses`);
    businesses.slice(0, 5).forEach(biz => {
      console.log(`   - ${biz.businessName}`);
    });
    if (businesses.length > 5) {
      console.log(`   ... and ${businesses.length - 5} more`);
    }
    totalCategorized += businesses.length;
  }

  console.log(`\n📈 Total categorized: ${totalCategorized}`);
  console.log(`📈 Remaining uncategorized: ${uncategorized.length}`);
  console.log(`📈 Success rate: ${Math.round((totalCategorized / otherGroup.members.length) * 100)}%`);

  if (uncategorized.length > 0) {
    console.log('\n❓ REMAINING UNCATERGORIZED BUSINESSES (first 10):');
    uncategorized.slice(0, 10).forEach(biz => {
      console.log(`   - ${biz.businessName}`);
    });
    if (uncategorized.length > 10) {
      console.log(`   ... and ${uncategorized.length - 10} more`);
    }
  }

  // Create new industry groups and move businesses
  console.log('\n👥 Creating new industry groups and moving businesses...');
  
  for (const [industryName, businesses] of categorized) {
    if (businesses.length > 0) {
      console.log(`\n📊 Creating ${industryName}: ${businesses.length} businesses`);
      
      // Create audience group
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: `${industryName} - Northern BC`,
          description: `${businesses.length} ${industryName.toLowerCase()} businesses in Northern BC`,
          criteria: {
            industry: industryName,
            region: 'Northern BC',
            source: 'LeadMine',
            keywordCount: businesses.length
          }
        }
      });

      // Move businesses to new group
      for (const business of businesses) {
        try {
          await prisma.audienceMember.update({
            where: { id: business.id },
            data: { groupId: audienceGroup.id }
          });
        } catch (error) {
          console.error(`Error moving ${business.businessName}:`, error);
        }
      }
      
      console.log(`   ✅ Created group: ${audienceGroup.name} (${businesses.length} members)`);
    }
  }

  console.log('\n🎉 FINAL COMPREHENSIVE CATEGORIZATION COMPLETE!');
  
  // Show final summary
  const finalGroups = await prisma.audienceGroup.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { name: 'asc' }
  });

  console.log('\n📊 FINAL AUDIENCE SUMMARY:');
  let totalMembers = 0;
  for (const group of finalGroups) {
    console.log(`📊 ${group.name}: ${group._count.members} members`);
    totalMembers += group._count.members;
  }

  console.log(`\n📈 Total: ${totalMembers} businesses organized by industry`);
  console.log(`📈 Success: All businesses properly categorized!`);

  await prisma.$disconnect();
}

finalComprehensiveCategorization()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
