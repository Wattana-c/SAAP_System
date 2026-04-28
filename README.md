# Affiliate Auto Post System 🚀

ระบบอัตโนมัติสำหรับดึงข้อมูลสินค้า (Shopee), สร้างแคปชันด้วย AI, สลับ Facebook Pages เพื่อโพสต์, และวิเคราะห์ประสิทธิภาพสินค้า (Smart Scoring)

---

## 📌 1. ภาพรวมระบบ (System Overview)

ระบบถูกออกแบบมาให้ทำงานแบบ Asynchronous ผ่านคิว (Queue) และ Background Workers เพื่อไม่ให้การทำงานหลักสะดุด

1. **ดึงข้อมูล (Scraping)**: ดึง URL Shopee → ลบพารามิเตอร์ลดความซ้ำซ้อน → แตกข้อมูล (ชื่อ, รูป, ช่วงราคา)
2. **สร้างโพสต์ (A/B Testing)**: ใช้ OpenAI สร้างแคปชัน 3 รูปแบบ (อารมณ์, เหตุผล, ตรงไปตรงมา) พร้อมสุ่มเพจ Facebook ที่ใช้งานน้อยที่สุด (Least Recently Used)
3. **ติดตาม (Tracking)**: สร้าง Redirect Link (`/r/:postId`) เพื่อนำไปแปะในโพสต์ เมื่อคนคลิก จะนับ CTR เก็บเข้า DB แล้วเด้งไปที่หน้า Shopee
4. **ทำซ้ำ (Optimization)**:
   - ระบบตั้งเวลา (Schedule Worker) คอยดึงโพสต์ไป Publish ลง Facebook ตามเวลาที่สุ่มไว้
   - ระบบ Optimization Worker วิเคราะห์ผลและนำสินค้าที่ขายดี (Top 10% CTR) วนมาสร้างโพสต์ใหม่

---

## ⚙️ 2. การติดตั้ง (Auto Setup / First Run)

### ขั้นตอนที่ 1: เตรียม Environment
คัดลอกไฟล์ตั้งค่า
\`\`\`bash
cp .env.example .env
\`\`\`
กรอกข้อมูลใน \`.env\` ให้ครบถ้วน:
- **DB Credentials**: ข้อมูลเชื่อมต่อ SQL Server
- **FRONTEND_URL**: URL หลักของระบบ (เช่น \`http://localhost:3000\`)
- **OPENAI_API_KEY**: คีย์สำหรับสร้าง AI Caption (ถ้าไม่ใส่จะใช้ Template แทน)
- **FB_...**: คีย์ตั้งต้นของ Facebook (สามารถเพิ่มเพจผ่าน Database Table \`pages\` ทีหลังได้)

### ขั้นตอนที่ 2: ติดตั้งและตรวจสอบระบบ
\`\`\`bash
npm install
npm run setup
\`\`\`
*(คำสั่ง setup จะทำการเช็ค DB Connection และ Facebook Token อัตโนมัติ)*

### ขั้นตอนที่ 3: เปิดเซิร์ฟเวอร์
\`\`\`bash
node src/server.js
\`\`\`
หน้าต่างควบคุม Admin UI จะอยู่ที่: \`http://localhost:3000/admin.html\`

---

## 📖 3. คู่มือการใช้งาน (Step-by-step Usage)

### วิธีการเพิ่มสินค้าเข้าคิว (Manual Trigger)
1. เปิดหน้า \`http://localhost:3000/admin.html\`
2. ที่ช่อง **Manual Trigger** กรอก URL สินค้าของ Shopee ลงไป
3. กด **Add to Queue**
4. แค่นี้เสร็จเลย! ระบบจะทำการดึงข้อมูล, Gen Caption และจับลงคิวโพสต์โดยอัตโนมัติ

### วิธีการตรวจสอบสถานะ (Dashboard)
ในหน้า Admin Dashboard สามารถดูสถิติได้ดังนี้:
- **Posts Today**: จำนวนโพสต์ที่ลงสำเร็จแล้วในวันนี้
- **Failed Posts**: โพสต์ที่ติดปัญหา
- **Recent Errors**: สถานะความผิดปกติของระบบ
- **Top Performing Products**: สินค้าขายดีเรียงตามคะแนน CTR

---

## 🔄 4. คู่มือการดูแลประจำวัน (Daily Operation Guide)

**สิ่งที่ต้องเช็คทุกวัน:**
1. **หน้า Admin UI**: เช็คดูยอด \`Failed Posts\` และ \`Recent Errors\` หากมี Error ทะลุเกณฑ์ (Safe Mode Active) ปุ่ม Automation จะตัดเป็น OFF อัตโนมัติ ให้เรามากด Toggle เปิดใหม่หลังจากแก้ปัญหาแล้ว
2. **System Logs**: ดู Log ในแถบด้านล่างว่ามีปัญหาการดึงข้อมูลจาก OpenAI หรือการโพสต์ Facebook ติดปัญหาเรื่อง Token ขาดอายุหรือไม่
3. **Top Products**: ตรวจสอบสินค้าที่ได้คะแนนสูงสุดเพื่อนำลิงก์สินค้าประเภทเดียวกันมาเติมในคิว

---

## 🛠 5. การแก้ไขปัญหาเบื้องต้น (Troubleshooting)

- **Scraper Fails (ดึงข้อมูลไม่สำเร็จ)**:
  - สาเหตุ: Shopee อาจติด Captcha บล็อกบอท
  - แก้ไข: ลองเปลี่ยน IP หรือเว้นระยะห่างการลงข้อมูล หากยังไม่ได้ ให้กดพักระบบ (Toggle Power เป็น OFF) สักระยะ
- **Facebook Post Fails**:
  - สาเหตุ: Access Token ของ Page หมดอายุ
  - แก้ไข: ตรวจสอบ Log และไป Generate Token ใหม่ในหน้า Meta for Developers แล้วนำมาอัปเดตในตาราง \`pages\` หรือไฟล์ \`.env\`
- **No Clicks (ไม่มีคนกดลิงก์)**:
  - สาเหตุ: แคปชันอาจจะโดนปิดกั้นการมองเห็น หรือสินค้าไม่ตรงกลุ่มเป้าหมายเพจ
  - แก้ไข: ระบบมี **A/B Testing** ให้รอดูเวอร์ชันไหนคนคลิกเยอะที่สุด และระบบ Optimization จะเรียนรู้และปรับ Prompt ในวันถัดไปเอง
- **ติด Safe Mode ตลอด**:
  - ระบบจะหยุดตัวเองหาก Error ถี่เกินไป (ค่าเริ่มต้น: 5 ครั้ง) สามารถแก้ไขค่า \`SAFE_MODE_ERROR_THRESHOLD\` ในหน้า Admin Config ได้
