import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enhanced intelligent categorization rules with industry patterns
const INTELLIGENT_CATEGORIZATION_RULES = {
  'HEALTHCARE_MEDICAL': [
    'hospital', 'medical', 'dental', 'doctor', 'dr.', 'clinic', 'health', 'wellness',
    'physiotherapy', 'physio', 'chiropractic', 'massage therapy', 'optometry', 'optical',
    'hearing', 'connect hearing', 'denture', 'counselling', 'counseling', 'foot care',
    'acupuncture', 'nursing', 'care', 'lifelabs', 'als canada', 'miracle-ear', 'amplifon'
  ],
  
  'RESTAURANTS_FOOD_SERVICE': [
    'restaurant', 'cafe', 'coffee', 'pizza', 'pizza hut', 'checkers pizza', 'boston pizza',
    'dennys', 'mrmikes', 'steakhouse', 'casual', 'bavarian inn', 'rest inn', 'days inn',
    'sandman inn', 'bear country inn', 'reel inn motel', 'best western', 'terrace inn',
    'cafenara', 'haryana', 'deli', 'berts delicatessen', 'kalum motel', 'costa-lessa motel',
    'food', 'catering', 'beverage', 'pepsi', 'coca cola', 'bottling'
  ],
  
  'RETAIL_SHOPPING': [
    'store', 'retail', 'shop', 'boutique', 'apparel', 'shoes', 'all star shoes',
    'winners', 'merchants', 'dollarama', 'wholesale club', 'canadian wholesale',
    'furniture', 'appliances', 'city furniture', 'uppal appliances', 'mattresses',
    'pet valu', 'books', 'misty river books', 'collectables', 'sonnys collectables'
  ],
  
  'ENTERTAINMENT_RECREATION': [
    'theatre', 'theater', 'tillicum theatres', 'bowling', 'bowling center', 'center',
    'dance', 'performing arts', 'art in motion', 'bingo', 'palace', 'chances terrace',
    'lucky dollar', 'sports', 'fgl sports', 'recreation', 'northstar recreation',
    'kens marine', 'studio', 'salon', 'spa', 'hairstudio', 'northern e-clips',
    'singing studio', 'celestial singing', 'studio 3 salon'
  ],
  
  'CHILDCARE_EDUCATION': [
    'childcare', 'daycare', 'child care', 'family childcare', 'little timbers',
    'sprouts', 'little sprouts', 'sunflower child care', 'caterpillars childcare',
    'center', 'kids at play', 'tiny steps', 'school', 'driving school',
    'sunset driving', 'philcan pro driving', 'training', 'northwest training'
  ],
  
  'FINANCIAL_SERVICES': [
    'bank', 'credit union', 'northern savings', 'cibc', 'toronto dominion', 'td bank',
    'edward jones', 'investment', 'wealth management', 'ig wealth', 'fairstone',
    'financial', 'money mart', 'tax service', 'liberty tax', 'western financial',
    'insurance', 'westland insurance', 'savings insurance', 'financial services',
    'primerca financial', 'amaranth financial', 'speedy cash', 'holdings'
  ],
  
  'REAL_ESTATE_PROPERTY': [
    'real estate', 'remax', 'coast mountains', 'property', 'properties', 'loon properties',
    'housing', 'makola housing', 'society', 'leasing', 'price leasing', 'holdings',
    'kermode holdings', 'wil-ann holdings', 'vlc holdings', 'dddkc holdings',
    'hemac investments', 'nalabila creek', 'investments', 'corp', 'amalco'
  ],
  
  'LEGAL_PROFESSIONAL_SERVICES': [
    'law', 'legal', 'attorney', 'lawyer', 'penner law', 'corporation', 'notary',
    'sherry anderson notary', 'warner bandstra brown', 'vohora', 'mnp', 'llp',
    'consulting', 'fins consulting', 'tcsiconsulting', 'kleanza consulting',
    'cedarwood consulting', 'northern business management', 'cypress forest consulting',
    'marios vision computer', 'fortec consulting', 'conlon counselling'
  ],
  
  'CONSTRUCTION_BUILDING': [
    'construction', 'building', 'contracting', 'excavating', 'excavating ltd',
    'welding', 'johnnys welding', 'roofing', 'skeena roofing', 'plumbing', 'heating',
    'kalum plumbing', 'haworth plumbing', 'abc plumbing', 'cabinet', 'cabinets',
    'renovations', 'ewald cabinets', 'tidal wave construction', 'montague contracting',
    'eby and sons construction', 'roofing', 'aj roofing', 'tar-rhone contracting',
    'building maintenance', 'cardinal building maintenance', 'l & s building maintenance',
    'carson construction', 'boc ventures', 'bangonconstruction', 'chad buhr contracting',
    'pro-built construction', 'progressive ventures construction', 'norlakes construction',
    'sinjur masonry', 'wiebe contracting', 'terus construction', 'kleanza construction',
    'tri-an contracting', 'silver pine contracting', 'steele contracting', 'obrien contracting',
    'bear creek construction', 'viking construction', 'dln contracting', 'fulljames gen',
    'amerispec inspections', 'convoysupply', 'convoy supply', 'canasteel rebar',
    'steel works', 'terrace steel works', 'peterbilt pacific', 'terrace redi-mix',
    'overhead doors', 'jr overhead doors', 'master sweeper', 'emil anderson maintenance',
    'sterling crane', 'brandt tractor', 'progressive ventures', 'pvlgroup'
  ],
  
  'TRANSPORTATION_LOGISTICS': [
    'towing', 'transportation', 'logistics', 'delivery', 'pick up', 'delivery',
    'ucallit pick up', 'courier', 'loomis express', 'purolator', 'helicopter',
    'yellowhead helicopters', 'canadian helicopters', 'central mountain air',
    'quantum helicopters', 'westjet', 'encore', 'rent a car', 'budget rent a car',
    'terrace motors', 'taxi', 'kalum kabs', 'kabs', 'driving', 'school'
  ],
  
  'MINING_NATURAL_RESOURCES': [
    'mining', 'resources', 'skeena valley resources', 'logging', 'forestry',
    'great bear forest', 'management', 'northpac forestry', 'lafarge', 'canada',
    'sawmills', 'skeenasawmills', 'wood', 'jj\'s wood art', 'bow valley machine',
    'bayview falling', 'ecofish research', 'nass river steelhead', 'company'
  ],
  
  'AUTOMOTIVE_SERVICES': [
    'auto', 'automotive', 'car', 'truck', 'vehicle', 'motor', 'innovation autoworks',
    'tire', 'kalum tire', 'fountain tire', 'auto refinishing', 'norms auto',
    'refinishing', 'garage', 'service', 'repair', 'maintenance'
  ],
  
  'MANUFACTURING_INDUSTRIAL': [
    'manufacturing', 'industrial', 'machine', 'shop', 'bow valley machine',
    'andritz automation', 'hilti', 'canada', 'corporation', 'emco', 'corporation',
    'eb horsman', 'son', 'thermax insulators', 'uap inc', 'napacanada'
  ],
  
  'STORAGE_SERVICES': [
    'storage', 'mini storage', 'lazelle mini storage', 's n t mini storage',
    'container', 'services', 'dj container services'
  ],
  
  'PEST_CONTROL': [
    'pest', 'control', 'orkin', 'canada', 'corporation', 'milligan'
  ],
  
  'PROPANE_FUEL': [
    'propane', 'superior propane', 'fuel', 'services', 'favron propane'
  ],
  
  'NEWSPAPER_MEDIA': [
    'newspaper', 'standard', 'terrace standard', 'blackpress', 'publishing',
    'ccb publishing', 'media'
  ],
  
  'SURVEYING_ENGINEERING': [
    'surveying', 'mcelhanney', 'associates', 'land surveying', 'engineering',
    'environmental', 'planning', 'landscape', 'architecture'
  ],
  
  'SAFETY_TRAINING': [
    'safety', 'training', 'sc safety', 'steven', 'flagging', 'strictly flagging'
  ],
  
  'INSURANCE_CLAIMS': [
    'insurance', 'claims', 'claimspro', 'inc', 'von pentz'
  ],
  
  'LABORATORY_TESTING': [
    'laboratory', 'labs', 'agat laboratories', 'ltd', 'zurowski'
  ],
  
  'ORTHODONTICS_DENTAL': [
    'orthodontics', 'nu-smile', 'dental', 'cedar coast dental', 'horizon dental',
    'complete denture centre', 'denture'
  ],
  
  'GUTTERS_EXTERIOR': [
    'gutters', 'watertight gutters', 'rain catcher gutters', 'exterior'
  ],
  
  'TINTING_WINDOWS': [
    'tinting', 'tripllleeffect', 'lll tinting', 'windows'
  ],
  
  'ELECTRICAL_DISTRIBUTION': [
    'electrical', 'distributor', 'horsman', 'son', 'canadian', 'family-owned'
  ],
  
  'CONSULTING_SERVICES': [
    'consulting', 'business', 'management', 'services', 'northern business management',
    'cypress forest consulting', 'cedarwood consulting', 'marios vision computer',
    'fortec consulting', 'conlon counselling', 'tcsiconsulting', 'kleanza consulting',
    'fins consulting'
  ],
  
  'GUTTER_CLEANING': [
    'gutter', 'cleaning', 'services'
  ],
  
  'SECURITY_SERVICES': [
    'security', 'services', 'garda world', 'cash services', 'canada corp',
    'billing', 'vancs'
  ],
  
  'NURSERY_LANDSCAPING': [
    'nursery', 'uplands nursery', 'spotted horse farm', 'nursery', 'landscaping',
    'plants', 'garden'
  ],
  
  'KENNELS_PET_SERVICES': [
    'kennels', 'uplands kennels', 'pet', 'services'
  ],
  
  'FARMING_AGRICULTURE': [
    'farm', 'daybreak farms', 'agriculture', 'farming'
  ],
  
  'BODY_WELLNESS': [
    'body', 'renewal', 'four hands body renewal', 'wellness', 'massage'
  ],
  
  'WASTE_MANAGEMENT': [
    'waste', 'management', 'canada corporation', 'wm.com', 'mwill'
  ],
  
  'TAX_SERVICES': [
    'tax', 'service', 'liberty tax service', 'terrace', 'libtaxbc'
  ],
  
  'INVESTMENT_SERVICES': [
    'investment', 'pollys investments', 'maylong', 'financial'
  ],
  
  'HELICOPTER_SERVICES': [
    'helicopter', 'yellowhead helicopters', 'canadian helicopters', 'central mountain air',
    'quantum helicopters'
  ],
  
  'RENTAL_SERVICES': [
    'rent', 'rental', 'easy rent tents', 'tents', 'marquees'
  ],
  
  'TRAILER_COURT': [
    'trailer', 'court', 'park avenue trailer court', 'park'
  ],
  
  'EXPRESS_DELIVERY': [
    'express', 'loomis express', 'purolator', 'inc', 'millan'
  ],
  
  'MOTORS_AUTOMOTIVE': [
    'motors', 'terrace motors', 'budget rent a car', 'automotive'
  ],
  
  'TIRE_SERVICES': [
    'tire', 'kalum tire service', 'fountain tire', 'services'
  ],
  
  'AUTO_REFINISHING': [
    'auto', 'refinishing', 'norms auto refinishing', 'automotive'
  ],
  
  'WORK_WEAR': [
    'work', 'wearhouse', 'marks work wearhouse', 'cantire', 'invoicewest'
  ],
  
  'REFORESTATION': [
    'reforestation', 'little trees reforestation', 'forestry'
  ],
  
  'SAWMILLS_WOOD': [
    'sawmills', 'skeenasawmills', 'wood', 'lumber'
  ],
  
  'CONCRETE_MATERIALS': [
    'concrete', 'lafarge', 'canada', 'inc', 'hole'
  ],
  
  'LOGGING_SERVICES': [
    'logging', 'main logging', 'ap', 'mainlogging'
  ],
  
  'DRILLING_SERVICES': [
    'drilling', 'double d drilling', 'services'
  ],
  
  'FORESTRY_CONSULTING': [
    'forestry', 'northpac forestry', 'group', 'dennis'
  ],
  
  'WOOD_ART': [
    'wood', 'art', 'jjs wood art', 'jung'
  ],
  
  'MACHINE_SHOP': [
    'machine', 'shop', 'bow valley machine shop', 'traction'
  ],
  
  'FURNITURE_APPLIANCES': [
    'furniture', 'appliances', 'city furniture', 'canada', 'harman'
  ],
  
  'BIKE_SERVICES': [
    'bike', 'wild bike', 'cycle', 'kc cycle'
  ],
  
  'APPLIANCES_MATTRESSES': [
    'appliances', 'mattresses', 'uppal appliances', 'mattresses'
  ],
  
  'PET_VALU': [
    'pet valu', 'canada', 'inc', 'businesslicensing'
  ],
  
  'BOOKS_RETAIL': [
    'books', 'misty river books', 'retail'
  ],
  
  'THEATRE_ENTERTAINMENT': [
    'theatre', 'tillicum theatres', 'entertainment'
  ],
  
  'BOWLING_RECREATION': [
    'bowling', 'center', 'terrace bowling center', 'recreation'
  ],
  
  'COLLECTABLES': [
    'collectables', 'sonnys collectables', 'retail'
  ],
  
  'DANCE_PERFORMING_ARTS': [
    'dance', 'performing arts', 'art in motion', 'center'
  ],
  
  'BINGO_ENTERTAINMENT': [
    'bingo', 'palace', 'lucky dollar bingo palace', 'chances terrace'
  ],
  
  'SPORTS_RETAIL': [
    'sports', 'fgl sports', 'retail'
  ],
  
  'LIQUOR_STORE': [
    'liquor', 'store', 'skeena liquor store'
  ],
  
  'MARINE_SERVICES': [
    'marine', 'kens marine', 'northstar recreation', 'services'
  ],
  
  'BOUTIQUE_RETAIL': [
    'boutique', 'sandpipers boutique', 'retail'
  ],
  
  'HAIRSTUDIO_BEAUTY': [
    'hairstudio', 'northern e-clips hairstudio', 'beauty'
  ],
  
  'SINGING_STUDIO': [
    'singing', 'studio', 'celestial singing studio'
  ],
  
  'SALON_SPA': [
    'salon', 'spa', 'studio 3 salon', 'wrhiller'
  ],
  
  'CHILDCARE_SERVICES': [
    'childcare', 'little timbers family childcare', 'services'
  ],
  
  'OPTICAL_LABORATORY': [
    'optical', 'laboratory', 'benson optical laboratory', 'carolyn'
  ],
  
  'CHIROPRACTIC_SERVICES': [
    'chiropractic', 'dr lindsay chiropractic', 'spinefit'
  ],
  
  'NATUROPATHIC_SERVICES': [
    'naturopathic', 'dr candice griffith', 'nd'
  ],
  
  'FAMILY_DAYCARE': [
    'daycare', 'little sprouts family daycare', 'foster'
  ],
  
  'ANIMAL_HOSPITAL': [
    'animal', 'hospital', 'terrace animal hospital', 'kangjatinder'
  ],
  
  'DENTAL_SERVICES': [
    'dental', 'cedar coast dental', 'vbedwell'
  ],
  
  'HOLDINGS_INVESTMENT': [
    'holdings', 'drouin holdings', 'investment'
  ],
  
  'HEARING_SERVICES': [
    'hearing', 'connect hearing', 'aplease'
  ],
  
  'DENTAL_PRACTICE': [
    'dental', 'dr thomas nagy', 'izrus'
  ],
  
  'DENTURE_SERVICES': [
    'denture', 'complete denture centre', 'mcalarey'
  ],
  
  'CHIROPRACTIC_PRACTICE': [
    'chiropractic', 'knight chiropractic', 'eldon'
  ],
  
  'COUNSELLING_SERVICES': [
    'counselling', 'northwest counselling centre', 'allison'
  ],
  
  'DENTAL_CLINIC': [
    'dental', 'horizon dental', 'edwarda'
  ],
  
  'MEDICAL_PRACTICE': [
    'medical', 'dr greg linton', 'parkavemedical'
  ],
  
  'PHYSIOTHERAPY_SERVICES': [
    'physiotherapy', 'cedar river physiotherapy', 'cedarriverphysio'
  ],
  
  'MEDICAL_PRACTICE_2': [
    'medical', 'dr johnathan moolman', 'parkavemedical'
  ],
  
  'CHILDCARE_CENTER': [
    'childcare', 'terrace sunflower child care centre', 'sunflower'
  ],
  
  'MEDICAL_PRACTICE_3': [
    'medical', 'dr j strydom', 'parkavemedical'
  ],
  
  'MASSAGE_THERAPY': [
    'massage therapy', 'health and motion massage therapy', 'heathermariermt'
  ],
  
  'MEDICAL_PRACTICE_4': [
    'medical', 'dr pc lotz', 'parkavemedical'
  ],
  
  'CHILDCARE_CENTER_2': [
    'childcare', 'caterpillars childcare center', 'caterpillars'
  ],
  
  'WELLNESS_CLINIC': [
    'wellness', 'nourishing life wellness clinic', 'acupunctureterrace'
  ],
  
  'FOOT_CARE_SERVICES': [
    'foot care', 'northwest foot care', 'jamie'
  ],
  
  'CREDIT_UNION': [
    'credit union', 'northern savings credit union', 'gracemakowski'
  ],
  
  'HOLDINGS_INVESTMENT_2': [
    'holdings', 'flipit holdings', 'mannsonthego'
  ],
  
  'LEASING_SERVICES': [
    'leasing', 'r & a price leasing', 'bobprice'
  ],
  
  'BANK_SERVICES': [
    'bank', 'cibc', 'bgis', 'lease admin'
  ],
  
  'HOLDINGS_INVESTMENT_3': [
    'holdings', 'kermode holdings', 'gingles'
  ],
  
  'HOLDINGS_INVESTMENT_4': [
    'holdings', 'wil-ann holdings', 'homerenosterrace'
  ],
  
  'HOLDINGS_INVESTMENT_5': [
    'holdings', 'vlc holdings', 'coutotheresa'
  ],
  
  'HOLDINGS_INVESTMENT_6': [
    'holdings', 'dddkc holdings', 'djephson'
  ],
  
  'MONEY_SERVICES': [
    'money', 'money mart', 'mfsg', 'lovemclendon'
  ],
  
  'INVESTMENT_SERVICES_2': [
    'investment', 'hemac investments', 'child.ca', 'mary'
  ],
  
  'BANK_SERVICES_2': [
    'bank', 'toronto dominion bank', 'td.com', 'dasilva'
  ],
  
  'INVESTMENT_SERVICES_3': [
    'investment', '3717 investments', 'studentworks', 'info'
  ],
  
  'INVESTMENT_SERVICES_4': [
    'investment', 'edward jones', 'edwardjones.com', 'branchtaxteam'
  ],
  
  'TAX_SERVICES_2': [
    'tax', 'liberty tax service', 'libtaxbc', 'terrace'
  ],
  
  'INVESTMENT_SERVICES_5': [
    'investment', 'pollys investments', 'takuresort', 'elizabeth'
  ],
  
  'MINI_STORAGE': [
    'storage', 'mini storage', 's n t mini storage', 'scsmith'
  ],
  
  'KENNELS_SERVICES': [
    'kennels', 'uplands kennels', 'wanda'
  ],
  
  'FARMING_SERVICES': [
    'farming', 'daybreak farms', 'kieran'
  ],
  
  'BODY_WELLNESS_SERVICES': [
    'body', 'wellness', 'four hands body renewal', 'sdbergstrom'
  ],
  
  'NURSERY_SERVICES': [
    'nursery', 'uplands nursery', 'yahoo.ca'
  ],
  
  'FARM_NURSERY': [
    'farm', 'nursery', 'spotted horse farm', 'nursery', 'twospottedhorses'
  ],
  
  'MOTEL_SERVICES': [
    'motel', 'kalum motel', 'peter-gill'
  ],
  
  'MOTEL_SERVICES_2': [
    'motel', 'costa-lessa motel', 'edbjohnson'
  ],
  
  'HEARING_SERVICES_2': [
    'hearing', 'miracle-ear canada', 'amplifon', 'accountspayable'
  ],
  
  'FALLING_SERVICES': [
    'falling', 'bayview falling', 'harrispalmer', 'rharris'
  ],
  
  'RESEARCH_SERVICES': [
    'research', 'ecofish research', 'accountspayable'
  ],
  
  'HAIR_SERVICES': [
    'hair', 'hairbusters', 'kochfam'
  ],
  
  'PEST_CONTROL_2': [
    'pest', 'control', 'orkin canada', 'corporation', 'milligan'
  ],
  
  'ENTERPRISES_SERVICES': [
    'enterprises', 'day enterprises', 'dayent'
  ],
  
  'INSTALLATIONS_SERVICES': [
    'installations', 'frontline installations', 'hotmail'
  ],
  
  'INDUSTRIES_SERVICES': [
    'industries', 'waylor industries', 'clean.waylor'
  ],
  
  'VENTURES_CONSTRUCTION': [
    'ventures', 'progressive ventures', 'pvlgroup', 'billing'
  ],
  
  'ENTERPRISES_PAINTING': [
    'enterprises', 'sixnine enterprises', 'painting'
  ],
  
  'INSTALLATIONS_CONSTRUCTION': [
    'installations', 'j & j installations', 'jonandjeny'
  ],
  
  'TRACTOR_SERVICES': [
    'tractor', 'brandt tractor', 'payables'
  ],
  
  'CRANE_SERVICES': [
    'crane', 'sterling crane', 'dgish'
  ],
  
  'MAINTENANCE_SERVICES': [
    'maintenance', 'emil anderson maintenance', 'emilanderson', 'apeams'
  ],
  
  'STEEL_SERVICES': [
    'steel', 'terrace steel works', 'terracesteel'
  ],
  
  'TRUCK_SERVICES': [
    'truck', 'peterbilt pacific', 'ahampton'
  ],
  
  'CONCRETE_SERVICES': [
    'concrete', 'terrace redi-mix', 'terraceredimix'
  ],
  
  'EXCAVATING_SERVICES': [
    'excavating', 'jl\'s excavating', 'jbennett'
  ],
  
  'DOORS_SERVICES': [
    'doors', 'jr overhead doors', 'jroverheaddoors'
  ],
  
  'SWEEPER_SERVICES': [
    'sweeper', 'master sweeper', 'mastersweeper'
  ],
  
  'STEELHEAD_SERVICES': [
    'steelhead', 'nass river steelhead', 'steve'
  ],
  
  'INSPECTIONS_SERVICES': [
    'inspections', 'fulljames gen', 'amerispec inspections', 'fulljames'
  ],
  
  'REBAR_SERVICES': [
    'rebar', 'canasteel rebar', 'joann'
  ],
  
  'WELDING_SERVICES': [
    'welding', 'johnnys welding', 'kelly'
  ],
  
  'SUPPLY_SERVICES': [
    'supply', 'convoy supply', 'convoy-supply'
  ],
  
  'PLUMBING_SERVICES': [
    'plumbing', 'abc plumbing', 'heating', 'danbel'
  ],
  
  'CONTRACTING_SERVICES': [
    'contracting', 'dln contracting', 'dnoble'
  ],
  
  'CONSTRUCTION_SERVICES': [
    'construction', 'pro-built construction', 'jwgpro'
  ],
  
  'CONSTRUCTION_SERVICES_2': [
    'construction', 'progressive ventures construction', 'pvlgroup', 'info'
  ],
  
  'CONSTRUCTION_SERVICES_3': [
    'construction', 'norlakes construction', 'muchowski'
  ],
  
  'MASONRY_SERVICES': [
    'masonry', 'sinjur masonry', 'vsinjur'
  ],
  
  'BUILDING_SUPPLIES': [
    'building', 'supplies', 'fraser valley building supplies', 'fvbs'
  ],
  
  'BUILDERS_CENTER': [
    'builders', 'center', 'terrace builders centre', 'rona', 'buildingsupplies'
  ],
  
  'CONTRACTING_SERVICES_2': [
    'contracting', 'wiebe contracting', 'myleswiebe'
  ],
  
  'CONSTRUCTION_SERVICES_4': [
    'construction', 'terus construction', 'colas western canada', 'gail.nelson'
  ],
  
  'CONSTRUCTION_SERVICES_5': [
    'construction', 'kleanza construction', 'kleanzaconstruction'
  ],
  
  'CONTRACTING_SERVICES_3': [
    'contracting', 'tri-an contracting', 'earlhovland'
  ],
  
  'CONTRACTING_SERVICES_4': [
    'contracting', 'silver pine contracting', 'penner0745'
  ],
  
  'CONTRACTING_SERVICES_5': [
    'contracting', 'steele contracting', 'steele4791'
  ],
  
  'CONTRACTING_SERVICES_6': [
    'contracting', 'obrien contracting', 'howardobrien'
  ],
  
  'ROOFING_SERVICES': [
    'roofing', 'skeena roofing', 'horseygirl'
  ],
  
  'PLUMBING_SERVICES_2': [
    'plumbing', 'kalum plumbing', 'heating', 'bpfugere'
  ],
  
  'CONSTRUCTION_SERVICES_6': [
    'construction', 'viking construction', 'rons'
  ],
  
  'CONSTRUCTION_SERVICES_7': [
    'construction', 'bear creek construction', 'bearcreekgroup', 'asullivan'
  ],
  
  'MAINTENANCE_SERVICES_2': [
    'maintenance', 'cardinal building maintenance', 'joesandhu'
  ],
  
  'CABINETS_SERVICES': [
    'cabinets', 'ewald cabinets', 'renovations', 'trewalds'
  ],
  
  'CONSTRUCTION_SERVICES_8': [
    'construction', 'tidal wave construction', 'iangordon'
  ],
  
  'CONTRACTING_SERVICES_7': [
    'contracting', 'montague contracting', 'montaguecontracting'
  ],
  
  'CONSTRUCTION_SERVICES_9': [
    'construction', 'eby and sons construction', 'ebycon', 'tony'
  ],
  
  'PROPANE_SERVICES': [
    'propane', 'favron propane', 'favronheating', 'denis'
  ],
  
  'ROOFING_SERVICES_2': [
    'roofing', 'aj roofing', 'aj.roofing'
  ],
  
  'CONTRACTING_SERVICES_8': [
    'contracting', 'tar-rhone contracting', 'mannsonthego'
  ],
  
  'MAINTENANCE_SERVICES_3': [
    'maintenance', 'l & s building maintenance', 'lavy'
  ],
  
  'CONSTRUCTION_SERVICES_10': [
    'construction', 'carson construction', 'carsonconstruction'
  ],
  
  'VENTURES_CONSTRUCTION_2': [
    'ventures', 'boc ventures', 'bangonconstruction'
  ],
  
  'CONTRACTING_SERVICES_9': [
    'contracting', 'chad buhr contracting', 'chadbuhr'
  ],
  
  'PLUMBING_SERVICES_3': [
    'plumbing', 'haworth plumbing', 'haworthplumbing'
  ]
};

function isPersonalNameOrNumbered(businessName: string): boolean {
  const name = businessName.toLowerCase();
  
  // Check for numbered companies
  const numberedPattern = /\d{7,8}\s+(bc\s+)?ltd|bc\s+\d{7,8}|canada\s+inc\.?\s*\d{7,8}/i;
  if (numberedPattern.test(name)) return true;
  
  // Check for personal names (individuals without clear business descriptors)
  const personalNamePatterns = [
    /^[a-z\s]+,\s*[a-z\s]+$/i, // "Last, First" format
    /^[a-z\s]+\s+[a-z\s]+$/i, // "First Last" format without business words
  ];
  
  const businessWords = ['ltd', 'inc', 'corp', 'llc', 'company', 'enterprises', 'services', 'group', 'holdings'];
  const hasBusinessWord = businessWords.some(word => name.includes(word));
  
  if (!hasBusinessWord && personalNamePatterns.some(pattern => pattern.test(name))) {
    return true;
  }
  
  return false;
}

function categorizeBusinessByName(businessName: string, email: string): string {
  const name = businessName.toLowerCase();
  const emailLower = email.toLowerCase();
  
  // Skip personal names and numbered companies
  if (isPersonalNameOrNumbered(businessName)) {
    return 'PERSONAL_NAMES_NUMBERED';
  }
  
  // Check each category with intelligent rules
  for (const [category, keywords] of Object.entries(INTELLIGENT_CATEGORIZATION_RULES)) {
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase()) || emailLower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'OTHER_INDUSTRIES';
}

async function intelligentIndustryCategorization() {
  console.log('🧠 Intelligent Industry Categorization...\n');

  try {
    // Get all current audience members
    const audienceMembers = await prisma.audienceMember.findMany({
      include: {
        group: true
      }
    });

    console.log(`📊 Found ${audienceMembers.length} audience members to recategorize`);

    // Create new categorization map
    const newCategorization = new Map<string, any[]>();
    
    for (const member of audienceMembers) {
      const newCategory = categorizeBusinessByName(member.businessName, member.primaryEmail);
      
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

    console.log('\n📊 New Intelligent Categorization:');
    for (const [category, members] of newCategorization) {
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   • ${groupName}: ${members.length} businesses`);
    }

    // Clear existing data
    console.log('\n🧹 Clearing existing audience data...');
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});

    // Create new audience groups
    console.log('\n👥 Creating intelligent audience groups...');
    
    for (const [category, members] of newCategorization) {
      if (members.length === 0) continue;
      
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      
      console.log(`   Creating: ${groupName} (${members.length} businesses)`);
      
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: groupName,
          description: `Businesses in ${groupName.toLowerCase()} industry - intelligent semantic categorization`,
          criteria: {
            industry: category,
            minMembers: members.length,
            categorizationMethod: 'intelligent_semantic_analysis',
            improved: true,
            semanticAnalysis: true,
            leadMineIntegration: true
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
              categorizedBy: 'intelligent_semantic_analysis'
            }
          }
        });
      }
      
      console.log(`   ✅ Added ${members.length} members to ${groupName}`);
    }

    // Final summary
    console.log('\n🎉 Intelligent Industry Categorization Complete!');
    console.log('\n📊 Final Summary:');
    
    const finalGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' }
    });
    
    const totalMembers = finalGroups.reduce((sum, group) => sum + group._count.members, 0);
    
    console.log(`   📧 Total Audience Groups: ${finalGroups.length}`);
    console.log(`   👥 Total Audience Members: ${totalMembers}`);
    
    console.log('\n📋 Intelligent Audience Groups:');
    finalGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

    // Show some examples from each category
    console.log('\n📋 Sample Businesses by Intelligent Category:');
    for (const group of finalGroups) {
      const sampleMembers = await prisma.audienceMember.findMany({
        where: { groupId: group.id },
        take: 3,
        select: { businessName: true, primaryEmail: true }
      });
      
      console.log(`\n   ${group.name}:`);
      sampleMembers.forEach(member => {
        console.log(`     • ${member.businessName} (${member.primaryEmail})`);
      });
    }

  } catch (error) {
    console.error('❌ Error in intelligent categorization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

intelligentIndustryCategorization();
