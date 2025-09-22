import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple, accurate categorization based on clear business name analysis
function categorizeBusinessSimply(businessName: string): string {
  const name = businessName.toLowerCase();
  
  // Check for numbered companies first (BC LTD, CANADA INC, etc.)
  if (/\d{7,8}\s+(bc\s+)?ltd|bc\s+\d{7,8}|canada\s+inc\.?\s*\d{7,8}|\d{7,8}\s+bc\s+ltd|\d{7,8}\s+canada\s+inc/i.test(businessName)) {
    return 'NUMBERED_COMPANIES';
  }
  
  // Check for clear industry identifiers (prioritize these over personal names)
  
  // Construction - very specific keywords
  if (name.includes('construction') || name.includes('contracting') || name.includes('contractor') || 
      name.includes('building') || name.includes('excavating') || name.includes('welding') || 
      name.includes('roofing') || name.includes('plumbing') || name.includes('electrical') || 
      name.includes('hvac') || name.includes('concrete') || name.includes('renovation') || 
      name.includes('landscaping') || name.includes('painting') || name.includes('flooring') || 
      name.includes('tile') || name.includes('siding') || name.includes('gutters') || 
      name.includes('windows') || name.includes('doors') || name.includes('fencing') || 
      name.includes('paving') || name.includes('asphalt') || name.includes('decking') || 
      name.includes('carpentry') || name.includes('framing') || name.includes('drywall') || 
      name.includes('masonry') || name.includes('insulation') || name.includes('spray foam') || 
      name.includes('foundation') || name.includes('remodeling') || name.includes('restoration') || 
      name.includes('repair') || name.includes('maintenance') || name.includes('architectural') || 
      name.includes('engineering') || name.includes('surveying') || name.includes('civil') || 
      name.includes('structural') || name.includes('mechanical') || name.includes('development') || 
      name.includes('developer') || name.includes('general contractor') || name.includes('subcontractor') || 
      name.includes('trades') || name.includes('craftsman')) {
    return 'CONSTRUCTION_CONTRACTING';
  }
  
  // Healthcare - very specific keywords
  if (name.includes('medical') || name.includes('medicine') || name.includes('healthcare') || 
      name.includes('clinic') || name.includes('hospital') || name.includes('doctor') || 
      name.includes('physician') || name.includes('nurse') || name.includes('dental') || 
      name.includes('dentist') || name.includes('orthodontist') || name.includes('denture') || 
      name.includes('oral') || name.includes('surgery') || name.includes('surgeon') || 
      name.includes('pharmacy') || name.includes('pharmacist') || name.includes('therapy') || 
      name.includes('therapist') || name.includes('massage') || name.includes('chiropractic') || 
      name.includes('chiropractor') || name.includes('acupuncture') || name.includes('naturopathic') || 
      name.includes('naturopath') || name.includes('holistic') || name.includes('wellness') || 
      name.includes('mental health') || name.includes('psychology') || name.includes('psychologist') || 
      name.includes('counseling') || name.includes('counselor') || name.includes('psychiatry') || 
      name.includes('psychiatrist') || name.includes('optometry') || name.includes('optometrist') || 
      name.includes('eye care') || name.includes('vision') || name.includes('hearing') || 
      name.includes('audiology') || name.includes('audiologist') || name.includes('hearing aids') || 
      name.includes('lab') || name.includes('laboratory') || name.includes('testing') || 
      name.includes('diagnostic') || name.includes('diagnosis') || name.includes('x-ray') || 
      name.includes('imaging') || name.includes('ultrasound') || name.includes('mri') || 
      name.includes('ct') || name.includes('scan') || name.includes('pathology') || 
      name.includes('pathologist') || name.includes('blood') || name.includes('urine') || 
      name.includes('sample')) {
    return 'HEALTHCARE_MEDICAL';
  }
  
  // Automotive - very specific keywords
  if (name.includes('auto') || name.includes('automotive') || name.includes('car') || 
      name.includes('vehicle') || name.includes('truck') || name.includes('motor') || 
      name.includes('engine') || name.includes('transmission') || name.includes('brake') || 
      name.includes('tire') || name.includes('wheel') || name.includes('alignment') || 
      name.includes('balancing') || name.includes('oil change') || name.includes('lube') || 
      name.includes('service') || name.includes('repair') || name.includes('mechanic') || 
      name.includes('garage') || name.includes('dealership') || name.includes('dealer') || 
      name.includes('sales') || name.includes('leasing') || name.includes('rental') || 
      name.includes('towing') || name.includes('tow') || name.includes('recovery') || 
      name.includes('collision') || name.includes('body shop') || name.includes('bodywork') || 
      name.includes('detailing') || name.includes('detail') || name.includes('wash') || 
      name.includes('washing') || name.includes('auto glass') || name.includes('windshield') || 
      name.includes('exhaust') || name.includes('muffler') || name.includes('performance') || 
      name.includes('tuning') || name.includes('custom')) {
    return 'AUTOMOTIVE_SERVICES';
  }
  
  // Food/Restaurants - very specific keywords
  if (name.includes('restaurant') || name.includes('food') || name.includes('dining') || 
      name.includes('cafe') || name.includes('coffee') || name.includes('bakery') || 
      name.includes('deli') || name.includes('pizza') || name.includes('burger') || 
      name.includes('sandwich') || name.includes('fast food') || name.includes('bar') || 
      name.includes('pub') || name.includes('tavern') || name.includes('lounge') || 
      name.includes('grill') || name.includes('steakhouse') || name.includes('seafood') || 
      name.includes('fish') || name.includes('chicken') || name.includes('italian') || 
      name.includes('chinese') || name.includes('mexican') || name.includes('thai') || 
      name.includes('indian') || name.includes('japanese') || name.includes('sushi') || 
      name.includes('buffet') || name.includes('catering') || name.includes('caterer') || 
      name.includes('event') || name.includes('banquet') || name.includes('wedding') || 
      name.includes('party') || name.includes('kitchen') || name.includes('chef') || 
      name.includes('cook') || name.includes('cuisine') || name.includes('menu') || 
      name.includes('takeout') || name.includes('delivery') || name.includes('hospitality') || 
      name.includes('hotel') || name.includes('motel') || name.includes('inn') || 
      name.includes('accommodation') || name.includes('lodging') || name.includes('resort')) {
    return 'FOOD_RESTAURANTS';
  }
  
  // Retail - very specific keywords
  if (name.includes('retail') || name.includes('store') || name.includes('shop') || 
      name.includes('shopping') || name.includes('mall') || name.includes('boutique') || 
      name.includes('department') || name.includes('clothing') || name.includes('apparel') || 
      name.includes('fashion') || name.includes('shoes') || name.includes('footwear') || 
      name.includes('jewelry') || name.includes('electronics') || name.includes('computer') || 
      name.includes('phone') || name.includes('mobile') || name.includes('appliance') || 
      name.includes('furniture') || name.includes('home') || name.includes('garden') || 
      name.includes('tools') || name.includes('hardware') || name.includes('sporting goods') || 
      name.includes('sports') || name.includes('recreation') || name.includes('toys') || 
      name.includes('books') || name.includes('bookstore') || name.includes('stationery') || 
      name.includes('office supplies') || name.includes('supplies') || name.includes('gift') || 
      name.includes('convenience') || name.includes('dollar store') || name.includes('variety') || 
      name.includes('discount') || name.includes('outlet') || name.includes('clearance') || 
      name.includes('sale') || name.includes('merchandise') || name.includes('product') || 
      name.includes('inventory') || name.includes('stock') || name.includes('wholesale') || 
      name.includes('wholesaler')) {
    return 'RETAIL_SHOPPING';
  }
  
  // Professional Services - very specific keywords
  if (name.includes('consulting') || name.includes('consultant') || name.includes('advisory') || 
      name.includes('advisor') || name.includes('professional services') || name.includes('business services') || 
      name.includes('management') || name.includes('manager') || name.includes('administration') || 
      name.includes('administrative') || name.includes('administrator') || name.includes('executive') || 
      name.includes('corporate') || name.includes('corporation') || name.includes('company') || 
      name.includes('enterprise') || name.includes('firm') || name.includes('agency') || 
      name.includes('bureau') || name.includes('institute') || name.includes('organization') || 
      name.includes('association') || name.includes('society') || name.includes('foundation') || 
      name.includes('group') || name.includes('team') || name.includes('staff') || 
      name.includes('personnel') || name.includes('human resources') || name.includes('hr') || 
      name.includes('recruitment') || name.includes('recruit') || name.includes('recruiter') || 
      name.includes('training') || name.includes('trainer') || name.includes('education') || 
      name.includes('educational') || name.includes('instructor') || name.includes('teacher') || 
      name.includes('coach') || name.includes('coaching') || name.includes('mentor') || 
      name.includes('mentoring') || name.includes('development') || name.includes('developer') || 
      name.includes('planning') || name.includes('planner') || name.includes('strategy') || 
      name.includes('strategic') || name.includes('strategist') || name.includes('analysis') || 
      name.includes('analyst') || name.includes('research') || name.includes('researcher') || 
      name.includes('market research') || name.includes('marketing') || name.includes('marketer') || 
      name.includes('advertising') || name.includes('advertiser') || name.includes('public relations') || 
      name.includes('pr') || name.includes('communications') || name.includes('communication') || 
      name.includes('media') || name.includes('promotion') || name.includes('promotional') || 
      name.includes('sales') || name.includes('seller') || name.includes('selling') || 
      name.includes('business development')) {
    return 'PROFESSIONAL_SERVICES';
  }
  
  // Technology - very specific keywords
  if (name.includes('technology') || name.includes('tech') || name.includes('information technology') || 
      name.includes('it') || name.includes('computer') || name.includes('software') || 
      name.includes('software development') || name.includes('programming') || name.includes('programmer') || 
      name.includes('developer') || name.includes('development') || name.includes('web development') || 
      name.includes('app development') || name.includes('mobile development') || name.includes('database') || 
      name.includes('databases') || name.includes('data') || name.includes('data management') || 
      name.includes('data analysis') || name.includes('analytics') || name.includes('business intelligence') || 
      name.includes('bi') || name.includes('artificial intelligence') || name.includes('ai') || 
      name.includes('machine learning') || name.includes('ml') || name.includes('automation') || 
      name.includes('automated') || name.includes('digital') || name.includes('digitization') || 
      name.includes('digitize') || name.includes('cybersecurity') || name.includes('security') || 
      name.includes('network') || name.includes('networking') || name.includes('infrastructure') || 
      name.includes('cloud') || name.includes('cloud computing') || name.includes('saas') || 
      name.includes('software as a service') || name.includes('platform') || name.includes('platforms') || 
      name.includes('system') || name.includes('systems') || name.includes('integration') || 
      name.includes('integrate') || name.includes('integrating') || name.includes('api') || 
      name.includes('apis') || name.includes('website') || name.includes('websites') || 
      name.includes('web design') || name.includes('web development') || name.includes('e-commerce') || 
      name.includes('ecommerce') || name.includes('online') || name.includes('internet') || 
      name.includes('digital marketing') || name.includes('seo') || name.includes('search engine optimization') || 
      name.includes('social media') || name.includes('content management') || name.includes('cms') || 
      name.includes('hosting') || name.includes('web hosting') || name.includes('server') || 
      name.includes('servers') || name.includes('server management') || name.includes('backup') || 
      name.includes('backups') || name.includes('recovery') || name.includes('disaster recovery') || 
      name.includes('support') || name.includes('technical support') || name.includes('help desk') || 
      name.includes('maintenance') || name.includes('maintain') || name.includes('upgrades') || 
      name.includes('upgrade') || name.includes('upgrading') || name.includes('implementation') || 
      name.includes('implement') || name.includes('implementing')) {
    return 'TECHNOLOGY_INFORMATION';
  }
  
  // Financial - very specific keywords
  if (name.includes('financial') || name.includes('finance') || name.includes('financing') || 
      name.includes('bank') || name.includes('banking') || name.includes('credit union') || 
      name.includes('investment') || name.includes('investments') || name.includes('investor') || 
      name.includes('investing') || name.includes('wealth management') || name.includes('wealth') || 
      name.includes('portfolio') || name.includes('portfolios') || name.includes('asset management') || 
      name.includes('assets') || name.includes('funds') || name.includes('fund') || 
      name.includes('mutual funds') || name.includes('insurance') || name.includes('insurer') || 
      name.includes('underwriter') || name.includes('underwriters') || name.includes('underwriting') || 
      name.includes('broker') || name.includes('brokers') || name.includes('brokerage') || 
      name.includes('trading') || name.includes('trader') || name.includes('traders') || 
      name.includes('securities') || name.includes('security') || name.includes('stocks') || 
      name.includes('stock') || name.includes('bonds') || name.includes('bond') || 
      name.includes('equity') || name.includes('equities') || name.includes('capital') || 
      name.includes('venture capital') || name.includes('private equity') || name.includes('hedge fund') || 
      name.includes('hedge funds') || name.includes('pension') || name.includes('pensions') || 
      name.includes('retirement') || name.includes('retirement planning') || name.includes('estate planning') || 
      name.includes('estate') || name.includes('tax') || name.includes('taxes') || 
      name.includes('taxation') || name.includes('accounting') || name.includes('accountant') || 
      name.includes('accountants') || name.includes('bookkeeping') || name.includes('bookkeeper') || 
      name.includes('bookkeepers') || name.includes('audit') || name.includes('auditing') || 
      name.includes('auditor') || name.includes('auditors') || name.includes('payroll') || 
      name.includes('payroll services') || name.includes('payroll processing') || name.includes('billing') || 
      name.includes('invoice') || name.includes('invoicing') || name.includes('collections') || 
      name.includes('collection') || name.includes('debt collection') || name.includes('credit') || 
      name.includes('credits') || name.includes('loan') || name.includes('loans') || 
      name.includes('lending') || name.includes('lender') || name.includes('lenders') || 
      name.includes('mortgage') || name.includes('mortgages')) {
    return 'FINANCIAL_SERVICES';
  }
  
  // Real Estate - very specific keywords
  if (name.includes('real estate') || name.includes('realtor') || name.includes('realty') || 
      name.includes('property') || name.includes('properties') || name.includes('real estate agent') || 
      name.includes('broker') || name.includes('brokerage') || name.includes('listing') || 
      name.includes('listings') || name.includes('sale') || name.includes('sales') || 
      name.includes('selling') || name.includes('buying') || name.includes('purchase') || 
      name.includes('purchasing') || name.includes('investment') || name.includes('investments') || 
      name.includes('investor') || name.includes('investors') || name.includes('development') || 
      name.includes('developments') || name.includes('developer') || name.includes('developers') || 
      name.includes('residential') || name.includes('commercial') || name.includes('industrial') || 
      name.includes('retail') || name.includes('office') || name.includes('warehouse') || 
      name.includes('warehouses') || name.includes('land') || name.includes('lots') || 
      name.includes('lot') || name.includes('acreage') || name.includes('acres') || 
      name.includes('acre') || name.includes('farm') || name.includes('farms') || 
      name.includes('ranch') || name.includes('ranches') || name.includes('estate') || 
      name.includes('estates') || name.includes('mansion') || name.includes('mansions') || 
      name.includes('condo') || name.includes('condos') || name.includes('condominium') || 
      name.includes('condominiums') || name.includes('townhouse') || name.includes('townhouses') || 
      name.includes('apartment') || name.includes('apartments') || name.includes('rental') || 
      name.includes('rentals') || name.includes('leasing') || name.includes('lease') || 
      name.includes('leases') || name.includes('property management') || name.includes('property manager') || 
      name.includes('property managers') || name.includes('maintenance') || name.includes('maintain') || 
      name.includes('repair') || name.includes('repairs') || name.includes('renovation') || 
      name.includes('renovations') || name.includes('remodeling') || name.includes('remodel') || 
      name.includes('restoration') || name.includes('restore') || name.includes('inspection') || 
      name.includes('inspections') || name.includes('inspector') || name.includes('inspectors') || 
      name.includes('appraisal') || name.includes('appraisals') || name.includes('appraiser') || 
      name.includes('appraisers') || name.includes('assessment') || name.includes('assessments') || 
      name.includes('assessor') || name.includes('assessors') || name.includes('valuation') || 
      name.includes('valuations') || name.includes('evaluate') || name.includes('evaluation') || 
      name.includes('market analysis') || name.includes('market research') || name.includes('comparative market analysis') || 
      name.includes('cma') || name.includes('fsbo') || name.includes('for sale by owner') || 
      name.includes('mls') || name.includes('multiple listing service')) {
    return 'REAL_ESTATE_PROPERTY';
  }
  
  // Entertainment - very specific keywords
  if (name.includes('entertainment') || name.includes('entertain') || name.includes('recreation') || 
      name.includes('recreational') || name.includes('leisure') || name.includes('leisure time') || 
      name.includes('fun') || name.includes('activities') || name.includes('activity') || 
      name.includes('events') || name.includes('event') || name.includes('event planning') || 
      name.includes('event planner') || name.includes('event planners') || name.includes('party') || 
      name.includes('parties') || name.includes('celebration') || name.includes('celebrations') || 
      name.includes('festival') || name.includes('festivals') || name.includes('concert') || 
      name.includes('concerts') || name.includes('music') || name.includes('musical') || 
      name.includes('band') || name.includes('bands') || name.includes('orchestra') || 
      name.includes('orchestras') || name.includes('symphony') || name.includes('symphonies') || 
      name.includes('theater') || name.includes('theatre') || name.includes('theaters') || 
      name.includes('theatres') || name.includes('cinema') || name.includes('cinemas') || 
      name.includes('movie') || name.includes('movies') || name.includes('film') || 
      name.includes('films') || name.includes('production') || name.includes('productions') || 
      name.includes('producer') || name.includes('producers') || name.includes('director') || 
      name.includes('directors') || name.includes('actor') || name.includes('actors') || 
      name.includes('actress') || name.includes('actresses') || name.includes('performer') || 
      name.includes('performers') || name.includes('performance') || name.includes('performances') || 
      name.includes('show') || name.includes('shows') || name.includes('exhibition') || 
      name.includes('exhibitions') || name.includes('gallery') || name.includes('galleries') || 
      name.includes('museum') || name.includes('museums') || name.includes('art') || 
      name.includes('arts') || name.includes('artist') || name.includes('artists') || 
      name.includes('artistic') || name.includes('creative') || name.includes('creativity') || 
      name.includes('design') || name.includes('designer') || name.includes('designers') || 
      name.includes('photography') || name.includes('photographer') || name.includes('photographers') || 
      name.includes('videography') || name.includes('videographer') || name.includes('videographers') || 
      name.includes('dance') || name.includes('dancing') || name.includes('dancer') || 
      name.includes('dancers') || name.includes('studio') || name.includes('studios') || 
      name.includes('gym') || name.includes('gyms') || name.includes('fitness') || 
      name.includes('fitness center') || name.includes('fitness centre') || name.includes('health club') || 
      name.includes('health clubs') || name.includes('sports') || name.includes('sport') || 
      name.includes('athletic') || name.includes('athletics') || name.includes('athlete') || 
      name.includes('athletes') || name.includes('coach') || name.includes('coaches') || 
      name.includes('coaching') || name.includes('training') || name.includes('trainer') || 
      name.includes('trainers') || name.includes('personal training') || name.includes('yoga') || 
      name.includes('pilates') || name.includes('martial arts') || name.includes('karate') || 
      name.includes('taekwondo') || name.includes('judo') || name.includes('boxing') || 
      name.includes('kickboxing') || name.includes('swimming') || name.includes('pool') || 
      name.includes('pools') || name.includes('tennis') || name.includes('golf') || 
      name.includes('golfing') || name.includes('skiing') || name.includes('snowboarding') || 
      name.includes('hiking') || name.includes('camping') || name.includes('outdoor') || 
      name.includes('adventure') || name.includes('adventures') || name.includes('tours') || 
      name.includes('tour') || name.includes('touring') || name.includes('guide') || 
      name.includes('guides') || name.includes('travel') || name.includes('traveling') || 
      name.includes('travelling') || name.includes('vacation') || name.includes('vacations') || 
      name.includes('holiday') || name.includes('holidays')) {
    return 'ENTERTAINMENT_RECREATION';
  }
  
  // Manufacturing - very specific keywords
  if (name.includes('manufacturing') || name.includes('manufacturer') || name.includes('manufacturers') || 
      name.includes('production') || name.includes('produce') || name.includes('fabrication') || 
      name.includes('fabricate') || name.includes('fabricated') || name.includes('machining') || 
      name.includes('machine') || name.includes('machines') || name.includes('machinist') || 
      name.includes('machinists') || name.includes('tooling') || name.includes('tools') || 
      name.includes('tool') || name.includes('equipment') || name.includes('machinery') || 
      name.includes('industrial') || name.includes('industry') || name.includes('industries') || 
      name.includes('factory') || name.includes('factories') || name.includes('plant') || 
      name.includes('plants') || name.includes('facility') || name.includes('facilities') || 
      name.includes('workshop') || name.includes('workshops') || name.includes('shop') || 
      name.includes('shops') || name.includes('mill') || name.includes('mills') || 
      name.includes('foundry') || name.includes('foundries') || name.includes('steel') || 
      name.includes('metal') || name.includes('metals') || name.includes('aluminum') || 
      name.includes('copper') || name.includes('brass') || name.includes('plastic') || 
      name.includes('plastics') || name.includes('composite') || name.includes('composites') || 
      name.includes('assembly') || name.includes('assembling') || name.includes('precision') || 
      name.includes('precision manufacturing') || name.includes('cnc') || name.includes('automation') || 
      name.includes('automated') || name.includes('robotics') || name.includes('robotic') || 
      name.includes('quality control') || name.includes('qc') || name.includes('inspection') || 
      name.includes('inspections') || name.includes('testing') || name.includes('test') || 
      name.includes('tests') || name.includes('calibration') || name.includes('calibrate') || 
      name.includes('certification') || name.includes('certified')) {
    return 'MANUFACTURING_INDUSTRIAL';
  }
  
  // Transportation - very specific keywords
  if (name.includes('transportation') || name.includes('transport') || name.includes('transporting') || 
      name.includes('logistics') || name.includes('logistic') || name.includes('shipping') || 
      name.includes('ship') || name.includes('shipping') || name.includes('freight') || 
      name.includes('freight services') || name.includes('cargo') || name.includes('cargo services') || 
      name.includes('delivery') || name.includes('deliver') || name.includes('delivering') || 
      name.includes('courier') || name.includes('couriers') || name.includes('express') || 
      name.includes('express delivery') || name.includes('mail') || name.includes('postal') || 
      name.includes('post') || name.includes('packages') || name.includes('package') || 
      name.includes('packaging') || name.includes('warehouse') || name.includes('warehouses') || 
      name.includes('storage') || name.includes('storing') || name.includes('distribution') || 
      name.includes('distribute') || name.includes('distributing') || name.includes('supply chain') || 
      name.includes('supply') || name.includes('supplies') || name.includes('procurement') || 
      name.includes('procure') || name.includes('procuring') || name.includes('inventory management') || 
      name.includes('inventory') || name.includes('stock') || name.includes('stocks') || 
      name.includes('fulfillment') || name.includes('fulfill') || name.includes('fulfilling') || 
      name.includes('order') || name.includes('orders') || name.includes('ordering') || 
      name.includes('dispatch') || name.includes('dispatching') || name.includes('dispatch service') || 
      name.includes('trucking') || name.includes('truck') || name.includes('trucks') || 
      name.includes('trucking company') || name.includes('hauling') || name.includes('haul') || 
      name.includes('hauling service') || name.includes('moving') || name.includes('movers') || 
      name.includes('moving company') || name.includes('relocation') || name.includes('relocate') || 
      name.includes('relocating') || name.includes('moving services') || name.includes('international') || 
      name.includes('domestic') || name.includes('local') || name.includes('long distance') || 
      name.includes('regional') || name.includes('national') || name.includes('cross border') || 
      name.includes('customs') || name.includes('customs clearance') || name.includes('import') || 
      name.includes('imports') || name.includes('export') || name.includes('exports') || 
      name.includes('importing') || name.includes('exporting') || name.includes('trade') || 
      name.includes('trading') || name.includes('commerce')) {
    return 'TRANSPORTATION_LOGISTICS';
  }
  
  // Forestry - very specific keywords
  if (name.includes('forestry') || name.includes('logging') || name.includes('log') || 
      name.includes('logs') || name.includes('lumber') || name.includes('lumbering') || 
      name.includes('timber') || name.includes('timbers') || name.includes('sawmill') || 
      name.includes('saw mills') || name.includes('mill') || name.includes('mills') || 
      name.includes('wood') || name.includes('wood products') || name.includes('wooden') || 
      name.includes('lumber yard') || name.includes('lumberyard') || name.includes('forest') || 
      name.includes('forests') || name.includes('forest management') || name.includes('tree') || 
      name.includes('trees') || name.includes('tree service') || name.includes('tree services') || 
      name.includes('arborist') || name.includes('arborists') || name.includes('cutting') || 
      name.includes('harvesting') || name.includes('harvest') || name.includes('harvester') || 
      name.includes('harvesters') || name.includes('chipper') || name.includes('chippers') || 
      name.includes('mulch') || name.includes('mulching') || name.includes('firewood') || 
      name.includes('fire wood') || name.includes('pulp') || name.includes('pulp mill') || 
      name.includes('paper') || name.includes('paper mill') || name.includes('paper products') || 
      name.includes('fiber') || name.includes('fibre') || name.includes('biomass') || 
      name.includes('reforestation') || name.includes('silviculture') || name.includes('silvicultural') || 
      name.includes('forest products') || name.includes('wood chips') || name.includes('woodchips') || 
      name.includes('lumber products') || name.includes('timber products') || name.includes('wood manufacturing') || 
      name.includes('forestry services') || name.includes('logging contractor') || name.includes('logging contractors') || 
      name.includes('forest contractor') || name.includes('forest contractors')) {
    return 'FORESTRY_LOGGING';
  }
  
  // Mining - very specific keywords
  if (name.includes('mining') || name.includes('mine') || name.includes('mines') || 
      name.includes('miner') || name.includes('miners') || name.includes('minerals') || 
      name.includes('mineral') || name.includes('ore') || name.includes('ores') || 
      name.includes('coal') || name.includes('coal mining') || name.includes('gold') || 
      name.includes('gold mining') || name.includes('silver') || name.includes('silver mining') || 
      name.includes('copper') || name.includes('copper mining') || name.includes('iron') || 
      name.includes('iron mining') || name.includes('steel') || name.includes('steel production') || 
      name.includes('metal mining') || name.includes('metals') || name.includes('metallic') || 
      name.includes('quarry') || name.includes('quarries') || name.includes('quarrying') || 
      name.includes('aggregate') || name.includes('aggregates') || name.includes('gravel') || 
      name.includes('gravel pit') || name.includes('sand') || name.includes('sand pit') || 
      name.includes('crushed stone') || name.includes('stone') || name.includes('rocks') || 
      name.includes('rock') || name.includes('drilling') || name.includes('driller') || 
      name.includes('drillers') || name.includes('exploration') || name.includes('explore') || 
      name.includes('explorer') || name.includes('explorers') || name.includes('prospecting') || 
      name.includes('prospect') || name.includes('prospector') || name.includes('prospectors') || 
      name.includes('geology') || name.includes('geological') || name.includes('geologist') || 
      name.includes('geologists') || name.includes('survey') || name.includes('surveying') || 
      name.includes('surveyor') || name.includes('surveyors') || name.includes('extraction') || 
      name.includes('extract') || name.includes('excavation') || name.includes('excavate') || 
      name.includes('excavator') || name.includes('excavators') || name.includes('bulldozer') || 
      name.includes('bulldozers') || name.includes('heavy equipment') || name.includes('equipment') || 
      name.includes('machinery') || name.includes('machines') || name.includes('trucking') || 
      name.includes('hauling') || name.includes('haul') || name.includes('haulage') || 
      name.includes('transport') || name.includes('transportation') || name.includes('resource') || 
      name.includes('resources') || name.includes('natural resources') || name.includes('energy') || 
      name.includes('oil') || name.includes('gas') || name.includes('petroleum') || 
      name.includes('natural gas') || name.includes('drilling') || name.includes('oil drilling') || 
      name.includes('gas drilling') || name.includes('well') || name.includes('wells') || 
      name.includes('rig') || name.includes('rigs') || name.includes('platform') || 
      name.includes('platforms') || name.includes('offshore') || name.includes('onshore') || 
      name.includes('production') || name.includes('produce') || name.includes('refinery') || 
      name.includes('refineries') || name.includes('processing') || name.includes('process') || 
      name.includes('refining') || name.includes('refine')) {
    return 'MINING_RESOURCES';
  }
  
  // Check for personal names (only if no industry identifiers found)
  if (/^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s*(inc|corp|ltd|llc|llp)\.?$/i.test(businessName) || 
      /^[A-Z][a-z]+\s+[A-Z][a-z]+$/i.test(businessName)) {
    return 'PERSONAL_NAMES';
  }
  
  // Everything else goes to other
  return 'OTHER_INDUSTRIES';
}

async function simpleAccurateCategorization() {
  console.log('🎯 Simple Accurate Categorization...\n');

  try {
    // Get all audience members
    const audienceMembers = await prisma.audienceMember.findMany({
      include: { group: true }
    });

    console.log(`📊 Found ${audienceMembers.length} audience members to recategorize`);

    // Create new categorization map
    const newCategorization = new Map<string, any[]>();
    
    for (const member of audienceMembers) {
      const newCategory = categorizeBusinessSimply(member.businessName);
      
      if (!newCategorization.has(newCategory)) {
        newCategorization.set(newCategory, []);
      }
      
      newCategorization.get(newCategory)!.push(member);
    }

    // Show current vs new categorization
    console.log('\n📊 Current Categorization:');
    const currentGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } }
    });
    
    currentGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

    console.log('\n📊 New Simple Accurate Categorization:');
    for (const [category, members] of newCategorization) {
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   • ${groupName}: ${members.length} businesses`);
    }

    // Clear existing data
    console.log('\n🧹 Clearing existing audience data...');
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});

    // Create new audience groups
    console.log('\n👥 Creating simple accurate audience groups...');
    
    for (const [category, members] of newCategorization) {
      if (members.length === 0) continue;
      
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      
      console.log(`   Creating: ${groupName} (${members.length} businesses)`);
      
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: groupName,
          description: `Businesses in ${groupName.toLowerCase()} industry - simple accurate categorization prioritizing industry identifiers over personal names`,
          criteria: {
            industry: category,
            minMembers: members.length,
            categorizationMethod: 'simple_accurate_industry_first',
            improved: true,
            semanticAnalysis: true,
            comprehensiveKeywords: true,
            industryFirstLogic: true
          }
        }
      });

      // Create audience members for this group
      for (const member of members) {
        await prisma.audienceMember.create({
          data: {
            groupId: audienceGroup.id,
            businessId: member.businessId,
            businessName: member.businessName,
            primaryEmail: member.primaryEmail,
            secondaryEmail: member.secondaryEmail,
            tagsSnapshot: member.tagsSnapshot,
            inviteToken: member.inviteToken,
            meta: {
              ...member.meta,
              recategorized: true,
              originalCategory: member.group.name,
              newCategory: category,
              categorizedBy: 'simple_accurate_industry_first'
            }
          }
        });
      }
      
      console.log(`   ✅ Added ${members.length} members to ${groupName}`);
    }

    // Final summary
    console.log('\n🎉 Simple Accurate Categorization Complete!');
    console.log('\n📊 Final Summary:');
    
    const finalGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' }
    });
    
    const totalMembers = finalGroups.reduce((sum, group) => sum + group._count.members, 0);
    
    console.log(`   📧 Total Audience Groups: ${finalGroups.length}`);
    console.log(`   👥 Total Audience Members: ${totalMembers}`);
    
    console.log('\n📋 Simple Accurate Audience Groups:');
    finalGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

  } catch (error) {
    console.error('❌ Error in simple categorization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleAccurateCategorization();
