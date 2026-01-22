// Jaymart Group Ecosystem Data
// รวบรวม Product/Solution/Service ทั้งหมดของเครือ Jaymart

export const jaymartCompanies = [
    {
        id: 'jmart',
        name: 'JMART',
        nameTh: 'เจมาร์ท โฮลดิ้ง',
        category: 'holding',
        categoryLabel: 'Holding Company',
        logo: 'J',
        color: '#E4000F',
        description: 'บริษัทแม่ของกลุ่มเจมาร์ท ดำเนินธุรกิจค้าปลีก การเงิน และเทคโนโลยี',
        website: 'https://jaymart.co.th',
        products: [
            { name: 'Jaymart Store', desc: 'ร้านค้าปลีกสมาร์ทโฟนและอุปกรณ์ IT กว่า 300 สาขา' },
            { name: 'Jaymart Mobile', desc: 'จำหน่ายโทรศัพท์มือถือและอุปกรณ์เสริม' },
            { name: 'J Point', desc: 'โปรแกรมสะสมแต้มลูกค้า' }
        ]
    },
    {
        id: 'jmt',
        name: 'JMT Network Services',
        nameTh: 'เจเอ็มที เน็ทเวิร์ค เซอร์วิสเซส',
        category: 'finance',
        categoryLabel: 'Financial Services',
        logo: 'JMT',
        color: '#1E1C1C',
        description: 'ผู้นำด้านการบริหารหนี้และติดตามทวงถามหนี้ในประเทศไทย',
        website: 'https://jmtnetwork.co.th',
        products: [
            { name: 'Debt Collection', desc: 'บริการติดตามทวงถามหนี้' },
            { name: 'NPL Management', desc: 'บริการบริหารหนี้ด้อยคุณภาพ' },
            { name: 'J Asset Management', desc: 'บริหารสินทรัพย์ด้อยคุณภาพ' }
        ]
    },
    {
        id: 'jventures',
        name: 'J Ventures',
        nameTh: 'เจ เวนเจอร์ส',
        category: 'technology',
        categoryLabel: 'Technology',
        logo: 'JVC',
        color: '#6C5CE7',
        description: 'Corporate Venture Capital และพัฒนา Digital Platform ของกลุ่ม',
        website: 'https://jventures.co.th',
        products: [
            { name: 'JFIN Coin', desc: 'Utility Token สำหรับระบบนิเวศ Jaymart' },
            { name: 'JFIN Chain', desc: 'Blockchain Layer 1 รองรับ DeFi และ NFT' },
            { name: 'Digital Core Lending', desc: 'แพลตฟอร์มสินเชื่อดิจิทัล' },
            { name: 'eKYC Service', desc: 'ยืนยันตัวตนแบบอิเล็กทรอนิกส์' },
            { name: 'Blockchain NFT', desc: 'บริการ NFT สำหรับธุรกิจ' },
            { name: 'P2P Lending', desc: 'สินเชื่อแบบ Peer-to-Peer' }
        ]
    },
    {
        id: 'jfintech',
        name: 'J Fintech',
        nameTh: 'เจ ฟินเทค',
        category: 'finance',
        categoryLabel: 'Financial Services',
        logo: 'JF',
        color: '#E4000F',
        description: 'บริการสินเชื่อส่วนบุคคลภายใต้กลุ่ม Jaymart',
        website: 'https://jfintech.co.th',
        products: [
            { name: 'JECO+', desc: 'แอปสินเชื่อส่วนบุคคล (แอปนี้)' },
            { name: 'Personal Loan', desc: 'สินเชื่อส่วนบุคคลอนุมัติง่าย' },
            { name: 'Pah Pay', desc: 'สินเชื่อ Pico License สำหรับ Unbanked' }
        ]
    },
    {
        id: 'jwallet',
        name: 'J Wallet / J Elite',
        nameTh: 'เจ วอลเล็ท',
        category: 'technology',
        categoryLabel: 'Technology',
        logo: 'JW',
        color: '#00B894',
        description: 'E-Wallet และระบบชำระเงินดิจิทัลของกลุ่ม Jaymart',
        website: 'https://jwallet.co.th',
        products: [
            { name: 'J Wallet App', desc: 'กระเป๋าเงินอิเล็กทรอนิกส์' },
            { name: 'J Elite VISA Card', desc: 'บัตร VISA ผูกกับ J Wallet' },
            { name: 'Bill Payment', desc: 'ชำระบิลและเติมเงิน' },
            { name: 'J Point Rewards', desc: 'ระบบสะสมแต้มและแลกของรางวัล' }
        ]
    },
    {
        id: 'jaymart-insurance',
        name: 'Jaymart Insurance',
        nameTh: 'เจมาร์ท ประกันภัย',
        category: 'insurance',
        categoryLabel: 'Insurance',
        logo: 'JMI',
        color: '#0984E3',
        description: 'ประกันวินาศภัยครบวงจร ทั้งรถยนต์ สุขภาพ และทรัพย์สิน',
        website: 'https://jaymartinsurance.co.th',
        products: [
            { name: 'พ.ร.บ. รถยนต์', desc: 'ประกันภาคบังคับรถยนต์' },
            { name: 'ประกันรถยนต์ชั้น 1', desc: 'Happy 1 Price คุ้มครองครบ' },
            { name: 'ประกันรถยนต์ชั้น 2+/3+', desc: 'ประกันรถแบบประหยัด' },
            { name: 'ประกันสุขภาพ', desc: 'คุ้มครองค่ารักษาพยาบาล' },
            { name: 'ประกันอุบัติเหตุ PA', desc: 'คุ้มครองกรณีอุบัติเหตุ' },
            { name: 'ประกันบ้าน/คอนโด', desc: 'ประกันทรัพย์สินอัคคีภัย' },
            { name: 'ประกันเดินทาง', desc: 'คุ้มครองการเดินทางต่างประเทศ' },
            { name: 'ประกันมะเร็ง', desc: 'คุ้มครองโรคมะเร็ง' }
        ]
    },
    {
        id: 'kb-j-capital',
        name: 'KB J Capital',
        nameTh: 'เคบี เจ แคปปิตอล',
        category: 'finance',
        categoryLabel: 'Financial Services',
        logo: 'KBJ',
        color: '#FDCB6E',
        description: 'JV ระหว่าง Jaymart และ KB Kookmin Card เกาหลีใต้',
        website: null,
        products: [
            { name: 'Personal Loan', desc: 'สินเชื่อส่วนบุคคล' },
            { name: 'Credit Line', desc: 'วงเงินสินเชื่อหมุนเวียน' }
        ]
    },
    {
        id: 'singer',
        name: 'Singer Thailand',
        nameTh: 'ซิงเกอร์ ประเทศไทย',
        category: 'retail',
        categoryLabel: 'Retail & Hire Purchase',
        logo: 'S',
        color: '#D63031',
        description: 'ขายตรงเครื่องใช้ไฟฟ้าและสินเชื่อผ่อนชำระ',
        website: 'https://singer.co.th',
        products: [
            { name: 'จักรเย็บผ้า Singer', desc: 'จักรเย็บผ้าแบรนด์ระดับโลก' },
            { name: 'เครื่องใช้ไฟฟ้า', desc: 'ตู้เย็น เครื่องซักผ้า แอร์' },
            { name: 'Hire Purchase', desc: 'ผ่อนสินค้า 0% ส่งถึงบ้าน' },
            { name: 'SG Capital', desc: 'สินเชื่อจำนำทะเบียนรถ' }
        ]
    },
    {
        id: 'jas-asset',
        name: 'JAS Asset',
        nameTh: 'แจส แอสเซ็ท',
        category: 'property',
        categoryLabel: 'Property',
        logo: 'JAS',
        color: '#636E72',
        description: 'พัฒนาและบริหารศูนย์การค้าคอมมูนิตี้มอลล์',
        website: 'https://jasasset.co.th',
        products: [
            { name: 'IT Junction', desc: 'พื้นที่ค้าปลีก IT และมือถือ' },
            { name: 'The JAS', desc: 'Community Mall' },
            { name: 'The JAS Urban', desc: 'Urban Community Mall' }
        ]
    },
    {
        id: 'casa-lapin',
        name: 'Casa Lapin',
        nameTh: 'คาซ่า ลาแปง',
        category: 'lifestyle',
        categoryLabel: 'Lifestyle & F&B',
        logo: '🐰',
        color: '#A29BFE',
        description: 'ร้านกาแฟสไตล์ Specialty Coffee',
        website: 'https://casalapin.com',
        products: [
            { name: 'Specialty Coffee', desc: 'กาแฟคุณภาพพรีเมียม' },
            { name: 'Bakery', desc: 'เบเกอรี่และขนมหวาน' },
            { name: 'Light Meal', desc: 'อาหารเบาๆ' }
        ]
    },
    {
        id: 'suki-teenoi',
        name: 'Suki Teenoi',
        nameTh: 'สุกี้ตี๋น้อย',
        category: 'lifestyle',
        categoryLabel: 'Lifestyle & F&B',
        logo: '🍲',
        color: '#FF7675',
        description: 'ร้านสุกี้และชาบูบุฟเฟ่ต์ราคาประหยัด',
        website: 'https://sukiteenoi.com',
        products: [
            { name: 'Suki Buffet', desc: 'สุกี้บุฟเฟ่ต์ไม่อั้น' },
            { name: 'Shabu Shabu', desc: 'ชาบูหม้อไฟ' },
            { name: 'Delivery', desc: 'บริการจัดส่งถึงบ้าน' }
        ]
    },
    {
        id: 'avantis',
        name: 'Avantis Laboratory',
        nameTh: 'อแวนติส แล็บอราทอรี่',
        category: 'technology',
        categoryLabel: 'Technology',
        logo: 'AV',
        color: '#00CEC9',
        description: 'บริการ Web3 และแพลตฟอร์ม Tokenization',
        website: null,
        products: [
            { name: 'Real Estate Tokenization', desc: 'แปลงสินทรัพย์อสังหาเป็น Token' },
            { name: 'Web3 Investment', desc: 'แพลตฟอร์มลงทุน Web3' }
        ]
    },
    {
        id: 'nation',
        name: 'Nation International',
        nameTh: 'เนชั่น อินเตอร์ฯ',
        category: 'media',
        categoryLabel: 'Media & Education',
        logo: 'N',
        color: '#2D3436',
        description: 'สื่อและความบันเทิงเพื่อการศึกษา',
        website: 'https://nationgroup.com',
        products: [
            { name: 'E-Learning', desc: 'แพลตฟอร์มการศึกษาออนไลน์' },
            { name: 'Content & Media', desc: 'สื่อและคอนเทนต์' }
        ]
    },
    {
        id: 'prtr',
        name: 'PRTR Group',
        nameTh: 'พีอาร์ทีอาร์ กรุ๊ป',
        category: 'service',
        categoryLabel: 'HR Services',
        logo: 'P',
        color: '#74B9FF',
        description: 'บริการจัดหาทรัพยากรบุคคลและ HR Solution',
        website: 'https://prtr.com',
        products: [
            { name: 'Recruitment', desc: 'บริการจัดหาพนักงาน' },
            { name: 'HR Outsourcing', desc: 'บริการ HR แบบ Outsource' },
            { name: 'Payroll Service', desc: 'บริการทำเงินเดือน' }
        ]
    },
    {
        id: 'bkd',
        name: 'Bangkok Dec-Con',
        nameTh: 'บางกอก เดค-คอน',
        category: 'construction',
        categoryLabel: 'Construction',
        logo: 'BKD',
        color: '#B2BEC3',
        description: 'รับเหมาตกแต่งภายในและก่อสร้าง',
        website: null,
        products: [
            { name: 'Interior Design', desc: 'ออกแบบตกแต่งภายใน' },
            { name: 'Construction', desc: 'รับเหมาก่อสร้าง' }
        ]
    }
]

// Group by category
export const getCompaniesByCategory = () => {
    const categories = {}
    jaymartCompanies.forEach(company => {
        if (!categories[company.category]) {
            categories[company.category] = {
                label: company.categoryLabel,
                companies: []
            }
        }
        categories[company.category].companies.push(company)
    })
    return categories
}

// Get all products/services count
export const getTotalProducts = () => {
    return jaymartCompanies.reduce((total, company) => total + company.products.length, 0)
}

// Category icons
export const categoryIcons = {
    holding: '🏢',
    finance: '💰',
    technology: '💻',
    insurance: '🛡️',
    retail: '🛒',
    property: '🏬',
    lifestyle: '☕',
    media: '📺',
    service: '👥',
    construction: '🏗️'
}
