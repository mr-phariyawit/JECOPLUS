import logger from '../utils/logger.js';

/**
 * Knowledge Base Service
 * Simple RAG (Retrieval-Augmented Generation) without vector DB
 * Uses keyword matching to retrieve relevant knowledge
 */
class KnowledgeBase {
  constructor() {
    // Knowledge entries with keywords and content
    this.knowledge = this.buildKnowledgeBase();
  }

  /**
   * Build comprehensive knowledge base
   * @returns {Array} Knowledge entries
   */
  buildKnowledgeBase() {
    return [
      // ==================== PRODUCTS ====================
      {
        id: 'product_personal_loan',
        category: 'product',
        title: 'สินเชื่อส่วนบุคคล',
        keywords: ['สินเชื่อส่วนบุคคล', 'กู้เงิน', 'personal', 'loan', 'เงินกู้'],
        content: `**สินเชื่อส่วนบุคคล**
- วงเงิน: 50,000 - 500,000 บาท
- อัตราดอกเบี้ย: 18-25% ต่อปี
- ระยะเวลาผ่อนชำระ: 12-48 เดือน
- คุณสมบัติผู้กู้:
  * มีรายได้ประจำ
  * อายุงานขั้นต่ำ 6 เดือน
  * อายุ 20-60 ปี
- เอกสารที่ต้องใช้:
  * บัตรประชาชน
  * สลิปเงินเดือน 3 เดือนล่าสุด
  * Statement บัญชีธนาคาร 6 เดือน
- ระยะเวลาพิจารณา: 1-3 วันทำการ`,
        priority: 1,
      },

      {
        id: 'product_kb_personal',
        category: 'product',
        title: 'KB Personal Loan',
        keywords: ['kb personal', 'kb', 'personal loan', 'สำหรับลูกค้าคุณภาพดี'],
        content: `**KB Personal Loan** (สำหรับลูกค้าคุณภาพดี)
- วงเงิน: 100,000 - 500,000 บาท
- อัตราดอกเบี้ย: 15-20% ต่อปี (ต่ำกว่าสินเชื่อทั่วไป)
- ระยะเวลาผ่อนชำระ: 12-48 เดือน
- คุณสมบัติผู้กู้:
  * ประวัติเครดิตดีเยี่ยม
  * รายได้ขั้นต่ำ 25,000 บาท/เดือน
  * อายุงานขั้นต่ำ 1 ปี
  * ไม่มีหนี้ค้างชำระ
- ข้อดี: ดอกเบี้ยต่ำ, วงเงินสูง, อนุมัติเร็ว
- เอกสารเพิ่มเติม:
  * หนังสือรับรองเงินเดือน
  * รายงานเครดิต (NCB)`,
        priority: 1,
      },

      {
        id: 'product_pah_pay',
        category: 'product',
        title: 'Pah Pay',
        keywords: ['pah pay', 'pah', 'pay', 'สินเชื่อระยะสั้น', 'เงินฉุกเฉิน'],
        content: `**Pah Pay** (สินเชื่อระยะสั้น)
- วงเงิน: 5,000 - 50,000 บาท
- อัตราดอกเบี้ย: 20-28% ต่อปี
- ระยะเวลาผ่อนชำระ: 3-12 เดือน
- จุดเด่น:
  * อนุมัติเร็วภายใน 1 วัน
  * เหมาะสำหรับเงินฉุกเฉิน
  * เอกสารน้อย
  * สะดวก รวดเร็ว
- คุณสมบัติผู้กู้:
  * มีรายได้ประจำ
  * อายุ 20-60 ปี
- เหมาะสำหรับ: ค่าใช้จ่ายฉุกเฉิน, ซ่อมรถ, ค่ารักษาพยาบาล`,
        priority: 1,
      },

      {
        id: 'product_car_title_loan',
        category: 'product',
        title: 'สินเชื่อจำนำทะเบียนรถ',
        keywords: ['จำนำทะเบียน', 'จำนำรถ', 'car title', 'รถยนต์', 'ทะเบียนรถ'],
        content: `**สินเชื่อจำนำทะเบียนรถ**
- วงเงิน: สูงสุด 80% ของราคาประเมินรถ
- อัตราดอกเบี้ย: 22-30% ต่อปี
- ระยะเวลาผ่อนชำระ: 12-60 เดือน
- ข้อดี:
  * ไม่ต้องจำนำตัวรถ (ใช้รถได้ตามปกติ)
  * วงเงินสูง
  * อนุมัติเร็ว
- เอกสารที่ต้องใช้:
  * บัตรประชาชน
  * สำเนาทะเบียนรถ
  * กรมธรรม์ประกันภัยรถยนต์
- รถที่รับจำนำ: รถยนต์ป้ายขาว อายุไม่เกิน 15 ปี`,
        priority: 1,
      },

      // ==================== FAQS ====================
      {
        id: 'faq_interest_rate',
        category: 'faq',
        title: 'ดอกเบี้ยคำนวณอย่างไร',
        keywords: ['ดอกเบี้ย', 'คำนวณ', 'interest', 'rate', 'คิดดอก'],
        content: `**วิธีคำนวณดอกเบี้ย**
- ใช้วิธีคำนวณแบบ Flat Rate (อัตราดอกเบี้ยคงที่)
- สูตร: ดอกเบี้ยทั้งหมด = เงินกู้ × อัตราดอกเบี้ย × จำนวนปี
- ตัวอย่าง:
  * กู้ 100,000 บาท
  * ดอกเบี้ย 20% ต่อปี
  * ผ่อน 2 ปี (24 เดือน)
  * ดอกเบี้ยทั้งหมด = 100,000 × 0.20 × 2 = 40,000 บาท
  * ยอดชำระทั้งหมด = 140,000 บาท
  * ค่างวดต่อเดือน = 140,000 / 24 = 5,833 บาท`,
        priority: 2,
      },

      {
        id: 'faq_approval_process',
        category: 'faq',
        title: 'ขั้นตอนการพิจารณาอนุมัติ',
        keywords: ['อนุมัติ', 'พิจารณา', 'approval', 'process', 'ขั้นตอน'],
        content: `**ขั้นตอนการพิจารณาอนุมัติ**
1. **ยื่นคำขอ** (15 นาที)
   - กรอกข้อมูลออนไลน์
   - อัพโหลดเอกสาร

2. **ตรวจสอบเบื้องต้น** (1 ชั่วโมง)
   - ตรวจสอบความครบถ้วนของเอกสาร
   - ติดต่อกลับเพื่อยืนยัน

3. **พิจารณาสินเชื่อ** (1-2 วันทำการ)
   - ตรวจสอบเครดิต (NCB)
   - วิเคราะห์ความสามารถในการชำระ
   - ประเมินความเสี่ยง

4. **แจ้งผลการอนุมัติ** (ทันที)
   - แจ้งผลทาง SMS/Email
   - แจ้งวงเงิน ดอกเบี้ย และเงื่อนไข

5. **ลงนามสัญญา** (1 วัน)
   - ลงนามสัญญาอิเล็กทรอนิกส์
   - หรือนัดหมายที่สาขา

6. **โอนเงิน** (ภายใน 24 ชั่วโมง)
   - โอนเข้าบัญชีที่ระบุ`,
        priority: 2,
      },

      {
        id: 'faq_rejection_reasons',
        category: 'faq',
        title: 'สาเหตุที่ถูกปฏิเสธ',
        keywords: ['ปฏิเสธ', 'ไม่ผ่าน', 'reject', 'denial', 'ไม่อนุมัติ'],
        content: `**สาเหตุที่ถูกปฏิเสธสินเชื่อ**
1. **รายได้ต่ำกว่าเกณฑ์**
   - รายได้ขั้นต่ำ 15,000 บาท/เดือน

2. **ประวัติเครดิตไม่ดี**
   - มีหนี้ค้างชำระ
   - เคยผิดนัดชำระ (NPL)
   - คะแนนเครดิต (NCB) ต่ำ

3. **ภาระหนี้สินสูงเกินไป**
   - ภาระหนี้รวมเกิน 50% ของรายได้

4. **เอกสารไม่ครบถ้วน**
   - ไม่ส่งเอกสารตามที่ร้องขอ
   - เอกสารหมดอายุ

5. **อายุงานน้อยเกินไป**
   - ต้องทำงานมาแล้วอย่างน้อย 6 เดือน

6. **ข้อมูลไม่ตรงกัน**
   - ข้อมูลในใบสมัครไม่ตรงกับเอกสาร

**ทำอย่างไรถ้าถูกปฏิเสธ?**
- รอ 3-6 เดือน แล้วยื่นใหม่
- ปรับปรุงคะแนนเครดิต
- ลดภาระหนี้สิน
- เพิ่มรายได้`,
        priority: 2,
      },

      {
        id: 'faq_payment_methods',
        category: 'faq',
        title: 'ช่องทางการชำระเงิน',
        keywords: ['ชำระ', 'จ่าย', 'payment', 'ผ่อน', 'โอนเงิน'],
        content: `**ช่องทางการชำระเงิน**
1. **โอนผ่านธนาคาร**
   - ธนาคารกสิกรไทย เลขที่ XXX-X-XXXXX-X
   - ธนาคารไทยพาณิชย์ เลขที่ XXX-X-XXXXX-X

2. **ตู้ ATM**
   - ทุกธนาคาร (มีค่าธรรมเนียม 10-15 บาท)

3. **Mobile Banking**
   - K-Plus, SCB Easy, KMA แอพธนาคารต่างๆ

4. **เคาน์เตอร์เซอร์วิส**
   - 7-Eleven ทุกสาขา
   - รหัสบริษัท: XXXXX

5. **หักบัญชีอัตโนมัติ (Auto Debit)**
   - สะดวก ไม่พลาดชำระ
   - สมัครได้ที่แอพหรือสาขา

**กำหนดชำระ**: วันที่ 5 หรือ 15 ของทุกเดือน
**แนะนำ**: ตั้งเตือนล่วงหน้า 2-3 วัน`,
        priority: 2,
      },

      {
        id: 'faq_early_payment',
        category: 'faq',
        title: 'ชำระก่อนกำหนด',
        keywords: ['ชำระก่อน', 'ปิดบัญชี', 'early payment', 'prepayment', 'ชำระครบ'],
        content: `**การชำระหนี้ก่อนกำหนด**
- **สามารถชำระก่อนได้**: ไม่มีค่าปรับ
- **ประหยัดดอกเบี้ย**: คิดดอกเบี้ยเฉพาะระยะเวลาที่ใช้จริง
- **ขั้นตอน**:
  1. แจ้งความประสงค์ที่ Call Center (02-XXX-XXXX)
  2. ขอยอดปิดบัญชี ณ วันที่ต้องการชำระ
  3. โอนเงินตามยอดที่แจ้ง
  4. ส่งสลิปโอนเงิน
  5. รอรับเอกสารปิดบัญชี (3-7 วัน)

**ตัวอย่าง**:
- กู้ 100,000 บาท, ดอกเบี้ย 20%/ปี, ผ่อน 2 ปี
- ถ้าชำระครบใน 1 ปี จะประหยัดดอกเบี้ยได้ประมาณ 10,000 บาท`,
        priority: 2,
      },

      {
        id: 'faq_late_payment',
        category: 'faq',
        title: 'ผลกระทบการชำระช้า',
        keywords: ['ชำระช้า', 'เลยกำหนด', 'late payment', 'ค้างชำระ', 'ผิดนัด'],
        content: `**ผลกระทบของการชำระเงินช้า**
1. **ค่าปรับ**
   - 200-500 บาทต่อครั้ง (ขึ้นกับยอดค่างวด)

2. **ดอกเบี้ยเพิ่ม**
   - คิดดอกเบี้ยเพิ่ม 1.5% ต่อเดือนจากยอดค้าง

3. **ส่งผลต่อเครดิต (NCB)**
   - ชำระช้าเกิน 3 เดือน จะรายงาน NCB
   - ส่งผลต่อการขอสินเชื่อในอนาคต

4. **ติดตามหนี้**
   - โทรติดตามจากเจ้าหน้าที่
   - ส่งจดหมายแจ้งเตือน

5. **ดำเนินคดี** (กรณีค้างนาน)
   - ฟ้องร้องทางกฎหมาย
   - ยึดทรัพย์ประกัน (กรณีมีหลักประกัน)

**ถ้าชำระไม่ทัน ทำอย่างไร?**
- ติดต่อเจ้าหน้าที่ทันที
- ขอปรับโครงสร้างหนี้
- ขอเลื่อนกำหนดชำระ
- ขอลดค่างวด`,
        priority: 2,
      },

      // ==================== DOCUMENTS ====================
      {
        id: 'doc_required_general',
        category: 'document',
        title: 'เอกสารที่ต้องใช้ทั่วไป',
        keywords: ['เอกสาร', 'document', 'ต้องใช้', 'เตรียม'],
        content: `**เอกสารที่ต้องใช้สำหรับทุกผลิตภัณฑ์**
1. **บัตรประชาชน**
   - ต้องไม่หมดอายุ
   - สแกนหน้าที่มีรูปและหน้าที่มีที่อยู่

2. **สลิปเงินเดือน**
   - 3 เดือนล่าสุด
   - ต้องมีตราประทับบริษัท

3. **Statement บัญชีธนาคาร**
   - 6 เดือนล่าสุด
   - แสดงรายรับ-รายจ่าย

**เอกสารเพิ่มเติม (แล้วแต่กรณี)**:
- หนังสือรับรองเงินเดือน
- สัญญาจ้าง
- ใบเสร็จค่าน้ำ-ค่าไฟ
- ทะเบียนบ้าน
- ทะเบียนสมรส (ถ้ามี)

**วิธีส่ง**:
- อัพโหลดผ่านแอพ JECO+
- ส่งทาง Email: docs@jecoplus.com
- ถ่ายรูปส่ง LINE: @jecoplus`,
        priority: 2,
      },

      // ==================== POLICIES ====================
      {
        id: 'policy_privacy',
        category: 'policy',
        title: 'นโยบายความเป็นส่วนตัว',
        keywords: ['ข้อมูลส่วนตัว', 'privacy', 'pdpa', 'ความปลอดภัย'],
        content: `**นโยบายความเป็นส่วนตัว (PDPA)**
JECO+ ให้ความสำคัญกับความเป็นส่วนตัวของลูกค้า

**ข้อมูลที่เก็บรวบรวม**:
- ข้อมูลส่วนตัว (ชื่อ, ที่อยู่, เบอร์โทร)
- ข้อมูลทางการเงิน (รายได้, หนี้สิน)
- ข้อมูลเครดิต (NCB)

**วัตถุประสงค์**:
- พิจารณาสินเชื่อ
- ติดต่อสื่อสาร
- ปรับปรุงบริการ

**ความปลอดภัย**:
- เข้ารหัสข้อมูล SSL/TLS
- เก็บในระบบที่ปลอดภัย
- จำกัดการเข้าถึง

**สิทธิของลูกค้า**:
- ขอเข้าถึงข้อมูล
- ขอแก้ไขข้อมูล
- ขอลบข้อมูล
- คัดค้านการใช้ข้อมูล`,
        priority: 3,
      },
    ];
  }

  /**
   * Retrieve relevant knowledge for a query
   * @param {string} query - User query
   * @param {number} maxResults - Maximum results to return
   * @returns {Array} Relevant knowledge entries
   */
  retrieveKnowledge(query, maxResults = 3) {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const scored = [];

    // Score each knowledge entry
    this.knowledge.forEach(entry => {
      let keywordScore = 0;

      // Check keyword matches
      entry.keywords.forEach(keyword => {
        if (queryLower.includes(keyword.toLowerCase())) {
          keywordScore += 10; // Base score for keyword match
        }
      });

      // Only include entries with keyword matches
      if (keywordScore === 0) {
        return; // Skip this entry
      }

      let score = keywordScore;

      // Bonus for category relevance
      if (queryLower.includes('product') || queryLower.includes('ผลิตภัณฑ์')) {
        if (entry.category === 'product') score += 5;
      }

      if (queryLower.includes('faq') || queryLower.includes('คำถาม')) {
        if (entry.category === 'faq') score += 5;
      }

      // Priority boost (only for entries with keyword matches)
      score += (4 - entry.priority); // Higher priority = higher score

      scored.push({ ...entry, score });
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Return top results
    const results = scored.slice(0, maxResults);

    logger.info(`[KB] Retrieved ${results.length} knowledge entries for query: "${query.substring(0, 50)}..."`);

    return results;
  }

  /**
   * Build enhanced prompt with knowledge
   * @param {string} basePrompt - Base system prompt
   * @param {string} userMessage - User message
   * @returns {string} Enhanced prompt with knowledge
   */
  buildEnhancedPrompt(basePrompt, userMessage) {
    const knowledge = this.retrieveKnowledge(userMessage);

    if (knowledge.length === 0) {
      return basePrompt;
    }

    // Build knowledge section
    let knowledgeSection = '\n\n## ข้อมูลเพิ่มเติมที่เกี่ยวข้อง\n\n';
    knowledgeSection += 'ใช้ข้อมูลด้านล่างนี้เพื่อตอบคำถามให้ถูกต้องและครบถ้วน:\n\n';

    knowledge.forEach((entry, index) => {
      knowledgeSection += `### ${index + 1}. ${entry.title}\n`;
      knowledgeSection += `${entry.content}\n\n`;
    });

    knowledgeSection += '**หมายเหตุ**: ใช้ข้อมูลข้างต้นเป็นหลัก อย่าแต่งเติมข้อมูลที่ไม่มี\n';

    return basePrompt + knowledgeSection;
  }

  /**
   * Get knowledge by ID
   * @param {string} id - Knowledge ID
   * @returns {object|null} Knowledge entry
   */
  getById(id) {
    return this.knowledge.find(k => k.id === id) || null;
  }

  /**
   * Get knowledge by category
   * @param {string} category - Category name
   * @returns {Array} Knowledge entries
   */
  getByCategory(category) {
    return this.knowledge.filter(k => k.category === category);
  }

  /**
   * Get statistics
   * @returns {object} Statistics
   */
  getStats() {
    const categories = {};
    this.knowledge.forEach(k => {
      categories[k.category] = (categories[k.category] || 0) + 1;
    });

    return {
      totalEntries: this.knowledge.length,
      categories,
      averageKeywordsPerEntry: (
        this.knowledge.reduce((sum, k) => sum + k.keywords.length, 0) /
        this.knowledge.length
      ).toFixed(1),
    };
  }
}

// Export singleton instance
export default new KnowledgeBase();
