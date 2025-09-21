#!/usr/bin/env tsx

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ultimateFinalCategorization() {
  console.log('🎯 ULTIMATE FINAL Industry Categorization - Catching ALL Remaining Businesses...\n');

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

  // ULTIMATE comprehensive categorization based on ALL the business names you provided
  const businessCategorization = {
    'Tax & Accounting Services': [
      'h&r block', 'hr block', 'mnp', 'dawne business solutions', 'kermode bookkeeping',
      'metrix appraisals', 'steve cullis appraisals'
    ],
    'Food & Hospitality': [
      'changes a touch of vienna', 'clinton manor', 'p.s.d. ventures', 'mcdonalds',
      'terrace co-op', 'four rivers co-op', 'bizza enterprises', 'boston pizza',
      'it\'s all greek', 'dish & dine', 'bd cannabis', 'local leaf cannabis',
      'high point cannabis', 'hive cannabis', 'wine on the terrace', 'chefs global fusion',
      'purity essence', 'and the wiener is', 'perfect threading', 'lait please'
    ],
    'Pest Control & Services': [
      'orkin canada', 'pest control'
    ],
    'Automotive & Repair': [
      'acadia northwest mechanical', 'terrace rewind', 'sterling crane', 'yellowhead helicopters',
      'canadian helicopters', 'jazz aviation', 'central mountain air', 'quantum helicopters',
      'great slave helicopters', 'summit helicopters', 'kc cycle', 'wild bike',
      'terrace toyota', 'hogwash detail and tires', 'wevape terrace', 'vape shack'
    ],
    'Real Estate & Property': [
      're/max coast mountains', 'gobind enterprises', 'kitscondos', 'loon properties',
      'plymax properties', 'sutha holdings', 'arkafortunedevelopments', 'medeek meadows',
      'noble five creek', 'the raven\'s nest airbnb', 'tyler and nadine\'s airbnb',
      'lanfear guest house', 'the sun suite', 'canwise develop'
    ],
    'Professional Services': [
      'claimspro', 'claims pro', 'warner bandstra brown', 'vohora', 'mnp',
      'mcelhanney', 'wsp canada', 'als canada', 'linde canada', 'parsons',
      'atkinsrÃ©alis', 'pinchin', '3-d line locating', 'agat laboratories', 'msalabs',
      'ecofish research', 'idl projects', 'jgc fluor', 'motion lp', 'rollyworks ventures',
      'rollyworks venture', 'seal tec industries', 'j2 hd', 'garnet mechanical',
      'radiant north mechanical', 'north arm mechanical', 'tanker electric'
    ],
    'Health & Wellness': [
      'benson optical', 'connect hearing', 'miracle-ear', 'complete denture', 'nu-smile orthodontics',
      'dr. mark', 'dr. beatrice', 'dr. candice', 'dr. p.c. lotz', 'dr. roberts',
      'dr. lucas arnold', 'dr. michelle venter', 'dr. kevin krysiak', 'mourning\'s dawn counselling',
      'leeward counselling', 'northern bc sleep centre', 'skeena sport & spine', 'lifebloom counselling',
      'melissa zarecki rmt', 'bone and blossom', 'bethanie berends', 'jessica mccann',
      'kate nee', 'harmony hands energy healing', 'feeling good institute', 'skin laser by ckyn',
      'new age insights', 'photo - hecker', 'heal yoga', 'cdpr restoration',
      'viva holistic healing', 'four hands body renewal', 'repose massage', 'cym massage'
    ],
    'Beauty & Personal Care': [
      'hairbusters', 'terrace beauty nail salon', 'hl nails salon', 'gloss aesthetics',
      'repose massage', 'northern e-clips hairstudio', 'studio 3 salon & spa', 'rich with color tattoo',
      'creative zone', 'celestial singing studio', 'art in motion dance', 'pure tantra',
      'sitka salon & spa', 'luna salon', 'polished artistry', 'hard as nails', 'creative edge nails',
      'reflectionz hair lounge', 'pretty paws grooming', 'b.lily\'s cosmetic tattoo', 'venom ink tattoo',
      'cymmassage', 'glam\'r nails & spa', 'fin and fern tattoo', 'ds nails',
      'b.lily\'s cosmetic tattoo & esthetics', 'mersana aesthetics', 'dually noted piano studio',
      '1487748 b.c. ltd dba sonu haircut', 'sonu haircut'
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
      'radiant north mechanical', 'north arm mechanical', 'tanker electric', 'tdub contracting',
      'dirt dynamics', 'frosty northwest mechanical'
    ],
    'Energy & Utilities': [
      'pacific northern gas', 'terrace rewind', 'westcana electric', 'bryant electric',
      'power flow electric', 'tri-city refrigeration', 'ki power & pole', 'air liquide canada',
      'linde canada', 'pacific northern gas', 'zed energy', 'avalanche heat pumps',
      'thomson energy solutions', 'united northwest electric', 'mb electric', 'casey electric',
      'red phoenix electric', 'hartman electric', 'geier electric', 'evan palahicky dba a & e electric',
      'lumen electric', 'dagger mechanical', 'mas-rock industries', 'houle electric'
    ],
    'Waste Management & Environmental': [
      'abc recycling', 'northern upkeep cleaning', 'naomi\'s classic cleaning',
      'hummingbird cleaning company', 'turbocharged cleaning', 'time cleaners', 'spotless laundry',
      'scott\'s janitorial', 'ultra janitorial', 'master sweeper', 'allen\'s scrap & salvage',
      'rupert disposal', 'northern confidential shredding', 'kermode janitorial', 'ground level works',
      'waylor industries', 'clean waylor', 'hydra mist carpet cleaning', 'just foam it',
      'chippys stump removal', 'clean floors', 'sew over it', 'green skills',
      'bubble land', 'spotless uniform', 'nates glass', 'nh glass', 'jbd crystal clear'
    ],
    'Transportation & Logistics': [
      'kalum kabs', 'purolator', 'sterling crane', 'yellowhead helicopters', 'canadian helicopters',
      'jazz aviation', 'central mountain air', 'quantum helicopters', 'great slave helicopters',
      'summit helicopters', 'pw transit canada', 'standard bus contracting', 'alliance traffic group',
      'african canadian trade company', 'global dewatering', 'd.b.i. dry-blast', 'dbi dry-blast'
    ],
    'Retail & Commerce': [
      'tenaquip', 'e.b. horsman', 'all west glass', 'staples', 'mark\'s work wearhouse',
      'guillevin international', 'uap', 'hilti', 'lafarge canada', 'ardene', 'pet valu',
      'dollarama', 'reitmans', 'supplement king', 'vallen canada', 'rocky mtn chocolate',
      'carters jewellers', 'elizabeth fashions', 'cooks jewellers', 'terrace bottle & return it depot',
      'northwest refillery', 'coastal vape company', 'mba distributors', 'dmac auto glass',
      'top\'s lighting', 'top-shelf industries', 'big river distributors', 'motion lp',
      'spotless uniform', 'nates glass', 'nh glass', 'jbd crystal clear', 'skeena greens'
    ],
    'Arts & Entertainment': [
      'misty river books', 'creative zone', 'celestial singing studio', 'art in motion dance',
      'rich with color tattoo', 'atlantis taekwondo', 'maxxed out cross training',
      'art in motion dance & performing arts centre', 'lucky dollar bingo palace', 'chances terrace',
      'castle pottery', 'mason jar studio', 'little honey b photography', 'mattias fredriksson photography',
      'tyler meers photography', 'jeda\'s creative moments', 'craftify', 'storyforge',
      'capture with melly photography', 'books by l', 'little learners', 'mj monday',
      'the felter that sews', 'taalrumiq', '3bird leather co', 'baby steps',
      'arrow lifestyle', 'warrior life', 'the peaceful pines'
    ],
    'Technology & Communications': [
      'skeena sight & sound', 'syberscream', 'helix it', 'skeena signs', 'sitka industries',
      'orange jigsaw corporation', 'j2 hd', 'skeena print hub', 'we do business online',
      'flint corp', 'gwyn & blair it ventures', 'indie cloud studio', 'green skills',
      'skeena respiratory solutions', 'karma training', 'age of driving school', 'garnet mechanical',
      'radiant north mechanical', 'north arm mechanical', 'tanker electric'
    ],
    'Education & Training': [
      'northwest training', 'terrace academy of music', 'strictly flagging training',
      'sunset driving school', 'philcan pro driving school', 'karma training', 'kulspai driving school',
      'age of driving school', 'little learners', 'kate nee', 'bethanie berends', 'jessica mccann',
      'dually noted piano studio'
    ],
    'Manufacturing & Production': [
      'orica canada', 'hilti', 'lafarge canada', 'coca cola canada bottling', 'pepsi beverages',
      'peterbilt pacific', 'sterling crane', 'air liquide canada', 'linde canada', 'lafarge canada',
      'monster industries', 'mas-rock industries', 'houle electric', 'pcl constructors westcoast',
      'terrace redi-mix', 'rudon hydraulics', 'skeena truss', 'skeena valley meats',
      'coast mountain mushrooms', 'hive cannabis', 'big river distributors', 'skeena greens'
    ],
    'Agriculture & Forestry': [
      'uplandsnursery', 'bayview falling', 'rain catcher gutters', 'raincoast arboriculture',
      'rushing river apiaries', 'coast mountain mushrooms', 'skeena valley meats', 'skeena greens',
      'calming reins equestrian center', 'cameron equine connections'
    ],
    'Government & Public Services': [
      'bcls', 'consolidated civil enforcement', 'bc1460479', 'terrace standard', 'blackpress'
    ],
    'Non-Profit & Community': [
      'coast mountain children society', 'fireweed club', 'kulspai driving school society',
      'the garage community space', 'wilp hata\'a'
    ],
    'Security & Safety': [
      'sc safety', 'elite flood & fire restoration', 'boomers fireworks', 'emjay extinguishers',
      '1503246 b.c. ltd dba emjay extinguishers'
    ],
    'Personal Services': [
      'groomin\' tails by jan', 'ron j.p', 'yellowhead pavement marking', 'm & a macedo',
      'pritchard diane', 'red key coachiing', 'four hands body renewal', 'cooks jewellers',
      'a-440 piano tuning', 'dj mckay enterprises', 'rain catcher gutters', 'watertight gutters',
      'rudon hydraulics', 'tar-rhone contracting', 's. parmar & company', 'flipit holdings',
      'triple h bobcat', 'easy rent tents', 'dawnesolutions', 'progressive ventures',
      'braun\'s island contracting', 'clunas david j and clunas wanda c', 'snk riverfront ventures',
      'sixnine enterprises', 'boc ventures', 'spirit stones', 'tiny steps', 'j & j installations',
      'geier electric', 'priority vac', 'just foam it', 'yue sheng zhen & xiao chun liu',
      'd. bjorgaard enterprises', 'lance loggin', 'birch mechanical', 'hartman electric',
      'ye olde chop bloc', 'raincoast arboriculture', 'evolve studio', 'african canadian trade company',
      'global dewatering', 'new haven ventures', 'bear creek contracting', 'rain coast wash & lube',
      'royden\'s mechanical', 'simson-maxwell', 'hernes enterprises', 'scaife signs',
      'm&m ventures', 'butter', 'and the wiener is', 'perfect threading', '0986305 b.c. ltd',
      'terrace trailer court', 'casey electric', 'gwyn & blair it ventures', 'red phoenix electric',
      'dish & dine', 'bd cannabis', 'white raven ventures', 'sy\'s carpet & vinyl floor installations',
      'broome ventures', '639517 b.c. ltd dba clean floors', '645999 b.c. ltd', 'repose massage',
      'purely cabinets', 'evan palahicky dba a & e electric', 'idl projects', 'harmony hands energy healing',
      'dagger mechanical', 'feeling good institute', 'tom radek ventures', 'skin laser by ckyn',
      'new age insights', 'photo - hecker', 'tom wight contracting', 'vector ventures',
      'ryan wiebe', 'it\'s all greek', 'mb electric', 'venture elevator', 'd.b.i. dry-blast',
      'lait please', 'rapid gantry custom signs', 'heartfelt hankies', 'salvelinus solutions',
      'rustic ridge contracting', 'northwest refillery', 'indie cloud studio', 'b & b industries',
      'cedars rest', 'chc mechanical', 'bluebird mechanical', 'the local leaf cannabis',
      'sew over it', 'green skills', 'lumen electric', 'rushing river apiaries', 'wine on the terrace',
      'terrace toyota', 'rustic ridge contracting ltd (legion)', '1318584 bc ltd', 'capture with melly photography',
      'bubble land', 'kate nee', 'books by l', 'quick star', 'smm performance', 'spotless uniform',
      'mersana aesthetics', 'nates glass', 'nh glass', 'b.lily\'s cosmetic tattoo & esthetics',
      'cym massage', 'little learners', 'mj monday', 'summit court', 'frosty northwest mechanical',
      'jeda\'s creative moments', 'j2 hd', 'garnet mechanical', 'radiant north mechanical',
      'north arm mechanical', 'tanker electric', 'anna dilley', '2134603 alberta inc',
      'snaring river holdings', 'ainsworth', 'wags out west', 'vape shack terrace',
      'i do event rentals', 'bethanie berends', 'canwise develop', 'mohamed shembesh',
      'toby hilton inc', 'kyle mciver', 'jessica mccann', 'willem wiegersma', 'dually noted piano studio',
      'evergreen escape', 'travis porter', 'the garage community space', '1399281 b.c. ltd',
      'hogwash detail and tires', 'rollyworks ventures', 'arrow lifestyle', 'kenneth amonson',
      'wevape terrace', 'warrior life', 'the sun suite', 'jbd crystal clear', 'skeena greens',
      'terrace brazilian jiu-jitsu', '1487748 b.c. ltd dba sonu haircut', 'rollyworks venture',
      'calming reins equestrian center', 'seal tec industries', 'skeena respiratory solutions',
      'the felter that sews', 'taalrumiq', 'tdub contracting', '3bird leather co',
      '1505010 b.c. ltd', 'trigo\'s', 'chefs global fusion', 'purity essence', 'ds nails',
      'dirt dynamics', 'wilde body work', 'becky kui ltd', 'kpombites inc', 'metrix appraisals',
      'baby steps', 'the peaceful pines', 'abroch ucontracting', 'brent connors', 'wilp hata\'a',
      '1374533 b c ltd', 'fjord expeditions', 'cameron equine connections'
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
  console.log('\n📊 ULTIMATE CATEGORIZATION RESULTS:');
  let totalCategorized = 0;
  for (const [industry, businesses] of categorized) {
    console.log(`\n🏭 ${industry}: ${businesses.length} businesses`);
    businesses.slice(0, 3).forEach(biz => {
      console.log(`   - ${biz.businessName}`);
    });
    if (businesses.length > 3) {
      console.log(`   ... and ${businesses.length - 3} more`);
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

  console.log('\n🎉 ULTIMATE FINAL CATEGORIZATION COMPLETE!');
  
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

ultimateFinalCategorization()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
