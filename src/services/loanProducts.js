// Jaymart Group Loan Products - สินเชื่อทั้งหมดในเครือ Jaymart
// รวมทุกประเภทสินเชื่อจาก J Fintech, KB J Capital, Singer, SG Capital

export const loanProducts = [
    // J Fintech Products
    {
        id: 'personal-loan',
        name: 'สินเชื่อส่วนบุคคล',
        nameEn: 'Personal Loan',
        provider: 'J Fintech',
        providerId: 'jfintech',
        category: 'personal',
        icon: '💰',
        color: '#E4000F',
        minAmount: 5000,
        maxAmount: 100000,
        interestRate: '18-25%',
        interestRateValue: 0.22,
        term: '6-36 เดือน',
        termMonths: [6, 12, 18, 24, 36],
        features: [
            'อนุมัติเร็วใน 24 ชม.',
            'ไม่ต้องมีหลักประกัน',
            'เบิกเงินได้ทันที',
            'ผ่อนสบาย 6-36 เดือน'
        ],
        requirements: [
            'อายุ 20-60 ปี',
            'มีรายได้ประจำ 9,000 บาท/เดือน',
            'บัตรประชาชน',
            'สลิปเงินเดือน/Statement'
        ],
        documents: ['บัตรประชาชน', 'สลิปเงินเดือน', 'Statement บัญชี 3 เดือน']
    },
    {
        id: 'pah-pay',
        name: 'สินเชื่อ Pah Pay',
        nameEn: 'Pah Pay Pico Loan',
        provider: 'J Fintech',
        providerId: 'jfintech',
        category: 'personal',
        icon: '🎯',
        color: '#FF6B6B',
        minAmount: 1000,
        maxAmount: 50000,
        interestRate: '30-36%',
        interestRateValue: 0.33,
        term: '3-12 เดือน',
        termMonths: [3, 6, 12],
        features: [
            'สำหรับผู้ที่ไม่มีเครดิต',
            'AI Credit Scoring',
            'ไม่ต้องมีประวัติธนาคาร',
            'สมัครผ่าน App ได้เลย'
        ],
        requirements: [
            'อายุ 20-55 ปี',
            'มีรายได้ประจำ',
            'บัตรประชาชน',
            'ไม่จำเป็นต้องมีบัญชีธนาคาร'
        ],
        documents: ['บัตรประชาชน', 'หลักฐานรายได้']
    },

    // KB J Capital Products
    {
        id: 'kb-personal',
        name: 'สินเชื่อ KB Personal',
        nameEn: 'KB Personal Loan',
        provider: 'KB J Capital',
        providerId: 'kb-j-capital',
        category: 'personal',
        icon: '🏦',
        color: '#FDCB6E',
        minAmount: 20000,
        maxAmount: 500000,
        interestRate: '15-22%',
        interestRateValue: 0.18,
        term: '12-60 เดือน',
        termMonths: [12, 24, 36, 48, 60],
        features: [
            'JV กับ KB Kookmin Bank เกาหลี',
            'วงเงินสูงถึง 500,000 บาท',
            'ดอกเบี้ยต่ำ เริ่ม 15%',
            'ผ่อนนานสูงสุด 60 เดือน'
        ],
        requirements: [
            'อายุ 21-55 ปี',
            'รายได้ขั้นต่ำ 15,000 บาท/เดือน',
            'อายุงาน 6 เดือนขึ้นไป',
            'ไม่มีประวัติค้างชำระ'
        ],
        documents: ['บัตรประชาชน', 'สลิปเงินเดือน 3 เดือน', 'Statement 6 เดือน']
    },

    // Singer Products
    {
        id: 'singer-hire',
        name: 'ผ่อนสินค้า Singer',
        nameEn: 'Singer Hire Purchase',
        provider: 'Singer Thailand',
        providerId: 'singer',
        category: 'hire-purchase',
        icon: '📺',
        color: '#D63031',
        minAmount: 3000,
        maxAmount: 150000,
        interestRate: '0-24%',
        interestRateValue: 0.12,
        term: '6-48 เดือน',
        termMonths: [6, 12, 24, 36, 48],
        features: [
            'ผ่อน 0% หลายรายการ',
            'ส่งสินค้าถึงบ้าน',
            'เครื่องใช้ไฟฟ้าแบรนด์ดัง',
            'ไม่ต้องใช้บัตรเครดิต'
        ],
        requirements: [
            'อายุ 20 ปีขึ้นไป',
            'มีรายได้ประจำ',
            'ที่อยู่ชัดเจน',
            'บุคคลค้ำประกัน (บางกรณี)'
        ],
        documents: ['บัตรประชาชน', 'สำเนาทะเบียนบ้าน', 'หลักฐานรายได้']
    },

    // SG Capital (Singer subsidiary)
    {
        id: 'sg-cartitle',
        name: 'สินเชื่อจำนำทะเบียนรถ',
        nameEn: 'Car Title Loan',
        provider: 'SG Capital',
        providerId: 'singer',
        category: 'secured',
        icon: '🚗',
        color: '#00CEC9',
        minAmount: 10000,
        maxAmount: 1000000,
        interestRate: '12-24%',
        interestRateValue: 0.18,
        term: '12-72 เดือน',
        termMonths: [12, 24, 36, 48, 60, 72],
        features: [
            'วงเงินสูงถึง 1 ล้านบาท',
            'ใช้รถยังได้ตามปกติ',
            'รถยนต์/มอเตอร์ไซค์',
            'อนุมัติไว 1-3 วัน'
        ],
        requirements: [
            'เป็นเจ้าของรถ',
            'ทะเบียนปลอดภาระ',
            'รถอายุไม่เกิน 15 ปี',
            'มีรายได้สม่ำเสมอ'
        ],
        documents: ['บัตรประชาชน', 'ทะเบียนรถ', 'กรมธรรม์ประกัน', 'หลักฐานรายได้']
    },

    // JMT Related
    {
        id: 'debt-consol',
        name: 'สินเชื่อรวมหนี้',
        nameEn: 'Debt Consolidation',
        provider: 'JMT Network',
        providerId: 'jmt',
        category: 'refinance',
        icon: '🔄',
        color: '#6C5CE7',
        minAmount: 50000,
        maxAmount: 2000000,
        interestRate: '12-18%',
        interestRateValue: 0.15,
        term: '24-84 เดือน',
        termMonths: [24, 36, 48, 60, 72, 84],
        features: [
            'รวมหนี้ทุกบัตร ทุกสินเชื่อ',
            'ลดภาระผ่อนต่อเดือน',
            'ดอกเบี้ยต่ำกว่าบัตรเครดิต',
            'ที่ปรึกษาหนี้ฟรี'
        ],
        requirements: [
            'มีหนี้รวม 50,000 บาทขึ้นไป',
            'มีรายได้ประจำ',
            'ไม่เคยถูกฟ้อง',
            'พร้อมเจรจาปิดหนี้เดิม'
        ],
        documents: ['บัตรประชาชน', 'ใบแจ้งหนี้เดิม', 'Statement 6 เดือน']
    }
]

// Jaymart Services that can be paid through JECO+
export const payableServices = [
    // Insurance
    {
        id: 'ins-motor',
        name: 'ประกันรถยนต์',
        category: 'insurance',
        provider: 'Jaymart Insurance',
        providerId: 'jaymart-insurance',
        icon: '🚗',
        description: 'พ.ร.บ. และประกันภัยรถยนต์ทุกชั้น',
        priceRange: '500 - 30,000 บาท/ปี'
    },
    {
        id: 'ins-health',
        name: 'ประกันสุขภาพ',
        category: 'insurance',
        provider: 'Jaymart Insurance',
        providerId: 'jaymart-insurance',
        icon: '💊',
        description: 'ประกันสุขภาพและอุบัติเหตุ',
        priceRange: '2,000 - 50,000 บาท/ปี'
    },
    {
        id: 'ins-travel',
        name: 'ประกันเดินทาง',
        category: 'insurance',
        provider: 'Jaymart Insurance',
        providerId: 'jaymart-insurance',
        icon: '✈️',
        description: 'คุ้มครองการเดินทางต่างประเทศ',
        priceRange: '200 - 2,000 บาท/ครั้ง'
    },

    // Retail
    {
        id: 'jaymart-shop',
        name: 'ซื้อสินค้า Jaymart',
        category: 'retail',
        provider: 'Jaymart Store',
        providerId: 'jmart',
        icon: '📱',
        description: 'โทรศัพท์มือถือ Gadgets อุปกรณ์ IT',
        priceRange: '990 - 100,000+ บาท'
    },
    {
        id: 'singer-products',
        name: 'สินค้า Singer',
        category: 'retail',
        provider: 'Singer Thailand',
        providerId: 'singer',
        icon: '📺',
        description: 'เครื่องใช้ไฟฟ้า จักรเย็บผ้า เครื่องทำน้ำอุ่น',
        priceRange: '2,000 - 80,000 บาท'
    },

    // F&B
    {
        id: 'casa-lapin',
        name: 'Casa Lapin',
        category: 'food',
        provider: 'Casa Lapin',
        providerId: 'casa-lapin',
        icon: '☕',
        description: 'ร้านกาแฟ Specialty พร้อมเบเกอรี่',
        priceRange: '80 - 500 บาท'
    },
    {
        id: 'suki-teenoi',
        name: 'สุกี้ตี๋น้อย',
        category: 'food',
        provider: 'Suki Teenoi',
        providerId: 'suki-teenoi',
        icon: '🍲',
        description: 'สุกี้ ชาบู บุฟเฟ่ต์ราคาประหยัด',
        priceRange: '199 - 399 บาท/คน'
    },

    // Property
    {
        id: 'jas-rental',
        name: 'เช่าพื้นที่ JAS',
        category: 'property',
        provider: 'JAS Asset',
        providerId: 'jas-asset',
        icon: '🏬',
        description: 'เช่าพื้นที่ IT Junction, The JAS',
        priceRange: '5,000 - 100,000 บาท/เดือน'
    },

    // Utility Bills
    {
        id: 'mobile-topup',
        name: 'เติมเงินมือถือ',
        category: 'utility',
        provider: 'All Operators',
        providerId: 'jmart',
        icon: '📲',
        description: 'AIS, DTAC, TRUE, MY และอื่นๆ',
        priceRange: '10 - 1,000 บาท'
    },
    {
        id: 'internet-pkg',
        name: 'แพ็กเกจเน็ต',
        category: 'utility',
        provider: 'All Operators',
        providerId: 'jmart',
        icon: '🌐',
        description: 'เติมเน็ตทุกเครือข่าย',
        priceRange: '9 - 599 บาท'
    },

    // Crypto/Web3
    {
        id: 'jfin-coin',
        name: 'ซื้อ JFIN Coin',
        category: 'crypto',
        provider: 'J Ventures',
        providerId: 'jventures',
        icon: '💎',
        description: 'Utility Token สำหรับ Jaymart Ecosystem',
        priceRange: 'ตามราคาตลาด'
    }
]

// Category labels
export const loanCategories = {
    personal: { label: 'สินเชื่อส่วนบุคคล', icon: '💰' },
    'hire-purchase': { label: 'ผ่อนสินค้า', icon: '🛒' },
    secured: { label: 'สินเชื่อมีหลักประกัน', icon: '🔐' },
    refinance: { label: 'รีไฟแนนซ์/รวมหนี้', icon: '🔄' }
}

export const serviceCategories = {
    insurance: { label: 'ประกันภัย', icon: '🛡️' },
    retail: { label: 'ช้อปสินค้า', icon: '🛒' },
    food: { label: 'อาหาร & เครื่องดื่ม', icon: '🍽️' },
    property: { label: 'อสังหาริมทรัพย์', icon: '🏢' },
    utility: { label: 'เติมเงิน/บริการ', icon: '📱' },
    crypto: { label: 'Crypto & Web3', icon: '💎' }
}

// Get loan by id
export const getLoanById = (id) => loanProducts.find(l => l.id === id)

// Get service by id
export const getServiceById = (id) => payableServices.find(s => s.id === id)
