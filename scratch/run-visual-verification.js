const { chromium } = require('/home/jaimepop/.nvm/versions/node/v22.22.0/lib/node_modules/@playwright/mcp/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SCREENSHOT_DIR = '/home/jaimepop/.gemini/antigravity/brain/2949092e-14b6-48ca-a92b-bd53011c78c7';

// Load env.local
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  }
});
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']);

async function run() {
  console.log('🚀 Connecting to browser via CDP...');
  const browser = await chromium.connectOverCDP(process.env.AGY_BROWSER_WS_URL);
  
  const contexts = browser.contexts();
  const context = contexts[0];
  const page = context.pages()[0] || await context.newPage();
  
  await page.setViewportSize({ width: 1280, height: 720 });
  
  console.log('🔑 Navigating to login page...');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  
  console.log('✍️ Filling credentials...');
  await page.fill('input[type="email"]', 'admin@dentiapp.online');
  await page.fill('input[type="password"]', 'danro32676');
  
  console.log('🖱️ Clicking login button...');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  
  console.log('📍 Current URL after login:', page.url());
  
  // Verify we are logged in. If we are redirected to /onboarding, we might need to handle it or go directly to the slug
  if (page.url().includes('/onboarding')) {
    console.log('⚠️ Onboarding page detected. Navigating to /dentiapp/dashboard...');
    await page.goto('http://localhost:3000/dentiapp/dashboard');
    await page.waitForTimeout(3000);
  }
  
  console.log('🏥 Navigating to Patient Admission...');
  await page.goto('http://localhost:3000/dentiapp/admission/patients');
  await page.waitForTimeout(3000);
  
  console.log('➕ Creating a new patient...');
  await page.goto('http://localhost:3000/dentiapp/admission/patients/new');
  await page.waitForTimeout(2000);
  
  // Fill new patient details
  await page.fill('input[name="first_name"]', 'Juan');
  await page.fill('input[name="last_name"]', 'Pérez');
  await page.fill('input[name="cedula"]', '1723456789');
  await page.fill('input[name="birth_date"]', '1990-05-15');
  await page.selectOption('select[name="gender"]', 'M');
  await page.fill('input[name="phone"]', '0998765432');
  await page.fill('input[name="email"]', 'juan.perez@gmail.com');
  await page.fill('textarea[name="address"]', 'Av. De los Shyris, Quito');
  await page.selectOption('select[name="status"]', 'active');
  await page.fill('textarea[name="observations"]', 'Paciente requiere tratamiento integral Form 033.');
  
  console.log('💾 Saving patient...');
  const saveBtn = page.locator('button[type="submit"]', { hasText: 'REGISTRAR PACIENTE' });
  await saveBtn.click();
  await page.waitForTimeout(4000);
  
  console.log('📍 Current URL after saving patient:', page.url());
  
  console.log('🔍 Querying patient ID from DB...');
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('cedula', '1723456789')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (patientError || !patientData) {
    throw new Error('Could not find patient ID in database: ' + (patientError?.message || 'No data found'));
  }
  const patientId = patientData.id;
  console.log('✅ Found Patient ID in DB:', patientId);
  
  // Now navigate to the Form 033 Wizard!
  console.log('📝 Navigating to Form 033 Wizard...');
  await page.goto(`http://localhost:3000/dentiapp/odontology/form-033/new?patient=${patientId}`);
  await page.waitForTimeout(4000);
  
  // --- DESKTOP WALKTHROUGH & SCREENSHOTS ---
  console.log('📸 --- DESKTOP WALKTHROUGH ---');
  
  // 1. Patient Info Section
  console.log('Filling Section 1: Motivo y Enfermedad...');
  await page.fill('textarea[name="consultation_reason"]', 'Dolor molar inferior izquierdo y control general');
  await page.check('input[name="pregnant"][value="false"]');
  await page.fill('textarea[name="current_problem"]', 'Dolor pulsátil de 3 días de evolución, aumenta con frío y masticación en zona molar inferior izquierda.');
  
  // Take screenshot of Step 1 (Motivo y Enfermedad)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_01_motivo.png') });
  console.log('Saved desktop_01_motivo.png');
  
  // 2. Antecedentes
  console.log('Filling Section 2: Antecedentes...');
  // Click allergy to antibiotics, diabetes, hypertension
  await page.click('label:has-text("Alergia a antibiótico")');
  await page.click('label:has-text("Diabetes")');
  await page.click('label:has-text("Hipertensión")');
  // Check 'Otro' under personal history to enter text
  await page.click('label:has-text("Otro (Personal)")');
  await page.fill('input[name="personal_history_other_text"]', 'Hepatitis B');
  // Family history
  await page.click('label:has-text("Otro (Familiar)")');
  await page.fill('input[name="family_history_other_text"]', 'Artritis');
  
  // Scroll to vitals
  await page.locator('#vitals').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  // 3. Signos Vitales
  console.log('Filling Section 3: Signos Vitales...');
  await page.fill('input[name="vital_bp"]', '120/80');
  await page.fill('input[name="vital_hr"]', '72');
  await page.fill('input[name="vital_rr"]', '16');
  await page.fill('input[name="vital_temp"]', '36.5');
  await page.fill('input[name="vital_spo2"]', '98');
  await page.fill('input[name="vital_weight"]', '75');
  await page.fill('input[name="vital_height"]', '1.75');
  
  // Scroll to Estomatognático
  await page.locator('#estomatognatico').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_02_antecedentes_vitals.png') });
  console.log('Saved desktop_02_antecedentes_vitals.png');
  
  // 4. Estomatognático
  console.log('Filling Section 4: Estomatognático...');
  // Labios region
  await page.fill('input[name="stomatognathic_1"]', 'Queilitis angular leve');
  // ATM
  await page.fill('input[name="stomatognathic_11"]', 'Chasquido leve sin dolor');
  
  // Scroll to Odontograma
  await page.locator('#odontograma').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  
  // 5. Odontograma
  console.log('Modifying Odontograma...');
  // Click on tooth 36. Let's find the SVG group for tooth 36.
  // The tooth number is text in the SVG, we can find a group that has the text '36' or is named tooth-36
  const tooth36 = page.locator('g:has(text:has-text("36"))').first();
  await tooth36.click();
  await page.waitForTimeout(1000);
  
  // Select 'Caries' status
  await page.click('button:has-text("Caries")');
  await page.waitForTimeout(500);
  
  // Select surface O as obturado (surface editor)
  // Let's check if the surfaces panel is visible and click 'O'
  const surfaceO = page.locator('button:has-text("O")').first();
  if (await surfaceO.isVisible()) {
    await surfaceO.click();
    await page.click('button:has-text("Obturado")');
  }
  
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_03_odontogram.png') });
  console.log('Saved desktop_03_odontogram.png');
  
  // Scroll to Indices
  await page.locator('#indices').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  // 6. Indices & Higiene
  console.log('Filling Section 6: Indices...');
  await page.selectOption('select[name="periodontal_disease"]', 'leve');
  await page.fill('input[name="indices_placa"]', '25');
  await page.fill('input[name="cpod_c"]', '2');
  await page.fill('input[name="cpod_p"]', '1');
  await page.fill('input[name="cpod_o"]', '3');
  
  // Scroll to Examenes & Diagnostico
  await page.locator('#examenes').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  // 7. Examenes
  console.log('Filling Section 7: Exámenes Complementarios...');
  await page.fill('textarea[name="exams_xray"]', 'Radiografía periapical: lesión periapical en pieza 36');
  await page.fill('textarea[name="exams_blood"]', 'Hemoglobina 14.2, Leucocitos 7800');
  
  // 8. Diagnostico
  console.log('Filling Section 8: Diagnóstico...');
  await page.fill('input[placeholder*="Buscá un diagnóstico"]', 'caries');
  await page.waitForTimeout(2000);
  // Click on the CIE suggestion (like K02.9 or K02.1)
  const suggestion = page.locator('div:has-text("K02.9")').first();
  if (await suggestion.isVisible()) {
    await suggestion.click();
  } else {
    // If not found, select first option
    await page.click('ul li button');
  }
  await page.selectOption('select[name="diagnosis_type"]', 'definitivo');
  await page.fill('textarea[name="diagnosis_notes"]', 'Caries dental penetrante en pieza 36');
  
  // Scroll to Plan
  await page.locator('#plan').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  // 9. Plan
  console.log('Filling Section 9: Plan...');
  await page.fill('textarea[name="educational_plan"]', 'Cepillado dental 3 veces al día con pasta fluorada, uso de hilo dental');
  await page.fill('textarea[name="diagnostic_plan"]', 'Pruebas de vitalidad pulpar y radiografía periapical de control en 36');
  
  // Scroll to Tratamiento
  await page.locator('#tratamiento').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  // 10. Tratamiento
  console.log('Filling Section 10: Tratamiento...');
  await page.fill('textarea[name="therapeutic_plan"]', 'Endodoncia de pieza 36, reconstrucción y corona de porcelana');
  await page.fill('textarea[name="treatment"]', 'Apertura de conductos en sesión 1, instrumentación rotatoria');
  
  // Prescription templates
  console.log('Applying Prescription template...');
  await page.click('button:has-text("Post-Extracción")');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_04_tratamiento.png') });
  console.log('Saved desktop_04_tratamiento.png');
  
  // Save entire form!
  console.log('💾 Saving wizard...');
  // Click the floating button at the bottom
  const saveAllBtn = page.locator('button:has-text("Guardar Todo")').last();
  await saveAllBtn.click();
  await page.waitForTimeout(5000);
  
  console.log('📍 Current URL after saving wizard:', page.url());
  
  // Verify we are on the Detail page
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_05_detalle.png') });
  console.log('Saved desktop_05_detalle.png');
  
  // --- MOBILE WALKTHROUGH (375x667) ---
  console.log('📸 --- MOBILE WALKTHROUGH ---');
  
  // Reuse same page but change viewport to mobile size
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  
  // Navigate to Form 033 Wizard (create new record for same patient on mobile viewport)
  console.log('[Mobile] Opening Wizard for same patient...');
  await page.goto(`http://localhost:3000/dentiapp/odontology/form-033/new?patient=${patientId}`);
  await page.waitForTimeout(4000);
  
  // Step 1: Motivo
  await page.fill('textarea[name="consultation_reason"]', '[Mobile] Dolor agudo molar');
  await page.check('input[name="pregnant"][value="false"]');
  await page.fill('textarea[name="current_problem"]', '[Mobile] Dolor severo pulsátil');
  
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_01_motivo.png') });
  console.log('Saved mobile_01_motivo.png');
  
  // Scroll to Antecedentes & Vital Signs
  await page.locator('#antecedentes').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_02_antecedentes_vitals.png') });
  console.log('Saved mobile_02_antecedentes_vitals.png');
  
  // Scroll to Odontograma
  await page.locator('#odontograma').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_03_odontogram.png') });
  console.log('Saved mobile_03_odontogram.png');
  
  // Scroll to Treatment
  await page.locator('#tratamiento').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  
  await page.fill('textarea[name="therapeutic_plan"]', '[Mobile] Plan de tratamiento endodoncia');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_04_tratamiento.png') });
  console.log('Saved mobile_04_tratamiento.png');
  
  // Save!
  const mobileSaveAllBtn = page.locator('button:has-text("Guardar Todo")').last();
  await mobileSaveAllBtn.click();
  await page.waitForTimeout(5000);
  
  console.log('📍 [Mobile] Current URL after saving:', page.url());
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_05_detalle.png') });
  console.log('Saved mobile_05_detalle.png');
  
  console.log('✅ Visual verification walkthrough completed successfully!');
  await context.close();
  await browser.close();
}

run().catch(err => {
  console.error('💥 Execution failed:', err);
  process.exit(1);
});
