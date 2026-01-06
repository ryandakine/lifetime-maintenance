import{s as y,T as Fe,j as t,A as me}from"./main-D2OIwsnq.js";import{r as n}from"./vendor-B6114-rA.js";import{k as U,U as W,X as We,l as G,m as Ge,T as He,M as H,d as ue,n as Be,o as Ve,b as Ye,p as Je,a as Qe,F as Ke,h as fe,q as Xe,r as Ze}from"./ui-7hvmghxF.js";import"./redux-CQk40qEf.js";const et=x=>{const m=n.useRef(null),S=n.useRef(null),[g,k]=n.useState({isAvailable:!1,isActive:!1,stream:null,error:null});n.useEffect(()=>{T()},[]),n.useEffect(()=>()=>{g.stream&&g.stream.getTracks().forEach(p=>p.stop())},[g.stream]);const T=n.useCallback(()=>{const p=navigator.mediaDevices&&navigator.mediaDevices.getUserMedia,u=p&&navigator.mediaDevices.enumerateDevices;return console.log("Camera access: "+(p?"available":"not available")),k(j=>({...j,isAvailable:!!u,error:p?null:"Camera not available"})),!!u},[]),$=n.useCallback(async()=>{try{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error("Camera API not supported");const p=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});return m.current&&(m.current.srcObject=p),k(u=>({...u,isActive:!0,stream:p,error:null})),console.log("Camera started successfully"),!0}catch(p){return console.error("Camera access error:",p),k(u=>({...u,isActive:!1,error:p.message})),!1}},[]),v=n.useCallback(()=>{g.stream&&g.stream.getTracks().forEach(p=>p.stop()),k(p=>({...p,isActive:!1,stream:null}))},[g.stream]),P=n.useCallback(()=>{if(!m.current||!S.current)return null;const p=m.current,u=S.current,j=u.getContext("2d");return u.width=p.videoWidth,u.height=p.videoHeight,j.drawImage(p,0,0,u.width,u.height),new Promise(E=>{u.toBlob(l=>{if(l){const d=new File([l],`camera-photo-${Date.now()}.jpg`,{type:"image/jpeg"});v(),x&&x(d),E(d)}else E(null)},"image/jpeg",.8)})},[v,x]);return{videoRef:m,canvasRef:S,isAvailable:g.isAvailable,isActive:g.isActive,error:g.error,checkCameraAvailability:T,startCamera:$,stopCamera:v,capturePhoto:P}},yt=()=>{console.log("Rendering Photos");const x=et(e=>{d(o=>({...o,photo:e})),ae(e,"camera")}),[m,S]=n.useState([]),[g,k]=n.useState([]),[T,$]=n.useState([]),[v,P]=n.useState(!1),[p,u]=n.useState({type:"",text:""}),[j,E]=n.useState(navigator.onLine),[l,d]=n.useState({photo:null,photoUrl:"",selectedTaskId:"",purpose:"clarification",analysis:"",loading:!1,showForm:!1,cameraMode:!1,uploadMode:"file",uploadType:"file"}),[b,R]=n.useState(!1),[B,V]=n.useState(""),[Y,J]=n.useState(null),[he,Q]=n.useState(!1),[A,_]=n.useState(""),[M,D]=n.useState(!1),[C,ge]=n.useState(null),[K,ye]=n.useState([]),[tt,xe]=n.useState([]),[N,ve]=n.useState(""),[ot,X]=n.useState([]),[st,rt]=n.useState(!1),[L,F]=n.useState([]),[Z,ee]=n.useState(!navigator.onLine),[at,it]=n.useState(!1),[nt,lt]=n.useState([]),[ct,dt]=n.useState(null),[pt,mt]=n.useState(null),[be,te]=n.useState(0),[oe,we]=n.useState(!0),se=20;n.useEffect(()=>{const e=()=>{E(!0),ee(!1),Ee()},o=()=>{E(!1),ee(!0)};return window.addEventListener("online",e),window.addEventListener("offline",o),()=>{window.removeEventListener("online",e),window.removeEventListener("offline",o)}},[]),n.useEffect(()=>{je()},[]),n.useEffect(()=>{z(),ie(),ne()},[]);const q=e=>{console.log("Upload mode: "+e),l.cameraMode&&e==="file"&&x.stopCamera(),d(o=>({...o,uploadMode:e,uploadType:e,cameraMode:e==="camera",photo:null,photoUrl:"",analysis:""}))},re=e=>{switch(e){case"clarification":return"Clarification";case"next_steps":return"Next Steps";case"verify_done":return"Verify Done";case"enhanced_analysis":return"Enhanced AI Analysis";default:return"Clarification"}},Se=e=>{switch(e){case"clarification":return t.jsx(fe,{size:16});case"next_steps":return t.jsx(Ze,{size:16});case"verify_done":return t.jsx(Xe,{size:16});case"enhanced_analysis":return t.jsx(G,{size:16});default:return t.jsx(fe,{size:16})}},Ie=async()=>{await x.startCamera()?d(o=>({...o,cameraMode:!0,showForm:!0})):(f("error","Camera access failed, using file upload instead"),d(o=>({...o,cameraMode:!1,uploadMode:"file",uploadType:"file",showForm:!0})))},ae=async(e,o="file")=>{try{if(d(c=>({...c,loading:!0})),Z){await de(e,l.purpose),d(c=>({...c,loading:!1}));return}const r=`project-photos/${Date.now()}_${e.name}`,{data:a,error:s}=await y.storage.from("photos").upload(r,e);if(s)throw s;const{data:{publicUrl:i}}=y.storage.from("photos").getPublicUrl(r);if(d(c=>({...c,photoUrl:i})),l.purpose==="enhanced_analysis"){const c=await ce(i,o);d(h=>({...h,analysis:JSON.stringify(c,null,2),loading:!1})),f("success","Enhanced AI analysis completed successfully")}else await le(i,o,l.purpose)}catch(r){console.error("Error processing photo:",r),Z?f("error","Failed to process photo"):(console.log("Upload failed, saving offline..."),await de(e,l.purpose)),d(a=>({...a,loading:!1}))}},z=async(e=!0)=>{try{P(!0);const o=e?0:be,r=o*se,a=r+se-1,{data:s,error:i,count:c}=await y.from("photos").select("*",{count:"exact"}).eq("user_id","current-user").order("created_at",{ascending:!1}).range(r,a);if(i)throw i;e?(S(s||[]),te(1)):(S(I=>[...I,...s||[]]),te(o+1));const h=e?(s==null?void 0:s.length)||0:m.length+((s==null?void 0:s.length)||0);we(c>h),console.log(`Photos loaded: ${(s==null?void 0:s.length)||0} (total: ${c})`)}catch(o){console.error("Error loading photos:",o),f("error","Failed to load photos")}finally{P(!1)}},ke=async()=>{!oe||v||await z(!1)},ie=async()=>{try{const{data:e,error:o}=await y.from(Fe.TASKS).select("id, task_list, status").eq("user_id","current-user").order("created_at",{ascending:!1});if(o)throw o;k(e||[])}catch(e){console.error("Error loading tasks:",e)}},ne=async()=>{try{const{data:e,error:o}=await y.from("equipment").select("*").eq("user_id","current-user").order("created_at",{ascending:!1});if(o)throw o;$(e||[]),console.log("Equipment loaded:",(e==null?void 0:e.length)||0)}catch(e){console.error("Error loading equipment:",e)}},Ae=async e=>{const o=e.target.files[0];o&&await ae(o,"file")},le=async(e,o="file",r="clarification")=>{try{const a=me.GROK_PRO;if(!a||a==="your-grok-key"){console.warn("Grok Pro API key not configured, using fallback analysis"),d({...l,analysis:"Photo analysis requires Grok Pro API key configuration.",loading:!1});return}let s="";if(l.selectedTaskId){const O=g.find($e=>$e.id===l.selectedTaskId);O&&(s=`

Related Task: ${O.task_list}`)}let i="";switch(r){case"clarification":i=`🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo with advanced computer vision capabilities.

${s}

## EQUIPMENT RECOGNITION
1. Identify the type of fitness equipment (treadmill, elliptical, weight machine, etc.)
2. Determine the brand and model if visible
3. Assess confidence level in equipment identification (0-100%)
4. Identify specific components visible in the photo

## DAMAGE DETECTION & ASSESSMENT
1. Detect any visible damage (cracks, rust, wear, loose parts, frayed cables)
2. Assess damage severity: LOW, MEDIUM, HIGH, CRITICAL
3. Identify affected components (belts, motors, bearings, cables, structural parts)
4. Detect safety hazards or potential failure points

## DETAILED ANALYSIS
1. Describe what you see in the photo
2. Identify the main issue or maintenance need
3. Explain what might be causing the problem
4. Provide context about the situation
5. Highlight any safety concerns

Format your response as:
## 🏋️ Equipment Identification
- **Type**: [Equipment type with confidence %]
- **Brand/Model**: [If identifiable]
- **Components Visible**: [List visible components]

## ⚠️ Damage Assessment
- **Severity Level**: [LOW/MEDIUM/HIGH/CRITICAL]
- **Damage Types**: [List detected damage]
- **Affected Components**: [Specific components with issues]
- **Safety Hazards**: [Any safety concerns]

## 🔍 Issue Analysis
[Describe what you see and identify the main issue]

## 📋 Problem Description
[Explain what might be causing the problem]

## 🛡️ Safety Notes
[Highlight any safety concerns or considerations]

## ❓ Questions for Clarification
[Ask specific questions to better understand the situation]`;break;case"next_steps":i=`🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo and provide specific next steps based on equipment type and damage assessment.

${s}

## EQUIPMENT RECOGNITION
1. Identify the type of fitness equipment
2. Determine brand and model if visible
3. Assess confidence level in equipment identification
4. Identify specific components that need attention

## DAMAGE ASSESSMENT
1. Evaluate damage severity and type
2. Identify critical vs. non-critical issues
3. Assess safety implications
4. Determine repair priority

## NEXT STEPS ANALYSIS
1. Identify what needs to be done next
2. Provide step-by-step instructions specific to the equipment type
3. List required tools and supplies
4. Include safety precautions
5. Estimate time and difficulty

Format your response as:
## 🏋️ Equipment Context
- **Type**: [Equipment type with confidence %]
- **Brand/Model**: [If identifiable]
- **Components Involved**: [Components needing attention]

## ⚠️ Damage Assessment
- **Severity**: [LOW/MEDIUM/HIGH/CRITICAL]
- **Issues**: [List of detected problems]
- **Safety Level**: [Safe/Moderate/Unsafe]

## 📋 Next Steps Required
[Identify what needs to be done next]

## 🔧 Step-by-Step Instructions
1. [First step - equipment specific]
2. [Second step - equipment specific]
3. [Continue as needed]

## 🛠️ Required Tools & Supplies
[List all tools and supplies needed for this equipment type]

## 🛡️ Safety Precautions
[Include safety measures specific to this equipment]

## ⏱️ Time & Difficulty Estimate
[Estimate time required and difficulty level]

## 📝 Additional Notes
[Any other important information]`;break;case"verify_done":i=`🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo and verify if the work has been completed correctly for the specific equipment type.

${s}

## EQUIPMENT VERIFICATION
1. Confirm equipment type and components
2. Verify that the correct components were addressed
3. Check for any missed areas or components

## QUALITY ASSESSMENT
1. Assess if the work appears complete and correct
2. Evaluate workmanship quality
3. Check for proper installation/repair
4. Verify safety standards compliance

## DAMAGE RESOLUTION
1. Confirm that identified damage has been addressed
2. Check for any remaining issues
3. Assess if repairs are adequate
4. Verify no new damage was introduced

Format your response as:
## 🏋️ Equipment Verification
- **Type**: [Equipment type]
- **Components Addressed**: [List components that were worked on]
- **Work Scope**: [What was supposed to be done]

## ✅ Work Verification
[Assess if the work appears complete and correct]

## 🎯 Quality Assessment
[Evaluate the quality of workmanship]

## ⚠️ Issues Found (if any)
[List any issues or incomplete work]

## 🔧 Suggested Fixes (if needed)
[Provide specific fixes for any issues]

## 🛡️ Safety Compliance
[Verify safety standards and compliance]

## 📊 Final Status
✅ Work Complete and Correct
⚠️ Work Needs Attention
❌ Work Incomplete

## 📋 Recommendations
[Final recommendations and next actions]`;break;default:i=`🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo with advanced computer vision capabilities.

${s}

## EQUIPMENT RECOGNITION
1. Identify the type of fitness equipment
2. Determine brand and model if visible
3. Assess confidence level in equipment identification
4. Identify specific components visible

## DAMAGE DETECTION
1. Detect any visible damage or wear
2. Assess damage severity
3. Identify affected components
4. Detect safety hazards

## GENERAL ANALYSIS
Provide comprehensive analysis of the photo including equipment context, damage assessment, and maintenance recommendations.`}console.log(`Photo analyzed for ${r}`);const c=await fetch("https://api.grok.x.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`},body:JSON.stringify({model:"grok-beta",messages:[{role:"user",content:[{type:"text",text:i},{type:"image_url",image_url:{url:e}}]}],max_tokens:1e3})});if(!c.ok){const O=await c.text();throw console.error("Grok Pro API error:",c.status,O),new Error(`Grok Pro API error: ${c.status}`)}const I=(await c.json()).choices[0].message.content,{error:w}=await y.from("photos").insert({user_id:"current-user",photo_url:e,task_id:l.selectedTaskId||null,response:I,purpose:r,upload_type:o,created_at:new Date().toISOString()});w&&console.error("Error saving photo analysis:",w),d({...l,analysis:I,loading:!1}),console.log(`Photo uploaded and analyzed with Grok Pro (type: ${o}, purpose: ${r})`),f("success","Photo uploaded and analyzed successfully"),await z()}catch(a){console.error("Error analyzing photo:",a),f("error","Failed to analyze photo"),d({...l,loading:!1})}},ce=async(e,o="file")=>{try{const r=me.GROK_PRO;if(!r||r==="your-grok-key")return console.warn("Grok Pro API key not configured, using fallback analysis"),{equipment:{type:"Unknown",confidence:0,brand:"Unknown",model:"Unknown"},damage:{severity:"UNKNOWN",types:[],components:[],safetyHazards:[]},analysis:"Enhanced AI analysis requires Grok Pro API key configuration."};const a=`🔍 ADVANCED COMPUTER VISION ANALYSIS - Equipment Recognition & Damage Detection

Analyze this fitness equipment photo with specialized computer vision capabilities for maintenance and safety assessment.

## EQUIPMENT RECOGNITION REQUIREMENTS
1. Identify the specific type of fitness equipment (treadmill, elliptical, weight machine, exercise bike, etc.)
2. Determine the brand and model if visible or identifiable
3. Assess confidence level in equipment identification (0-100%)
4. Identify all visible components and parts
5. Classify equipment category (cardio, strength, flexibility, etc.)

## DAMAGE DETECTION REQUIREMENTS
1. Detect any visible damage types:
   - Structural damage (cracks, bends, breaks)
   - Wear and tear (frayed cables, worn belts, rust)
   - Loose or missing parts
   - Electrical issues (exposed wires, damaged connectors)
   - Safety hazards (sharp edges, unstable parts)

2. Assess damage severity levels:
   - LOW: Minor cosmetic issues, no safety concerns
   - MEDIUM: Functional issues, some safety concerns
   - HIGH: Significant damage, safety concerns
   - CRITICAL: Severe damage, immediate safety hazard

3. Identify affected components:
   - Belts, motors, bearings, cables
   - Structural components, safety features
   - Electrical components, control systems

## SAFETY ASSESSMENT
1. Identify any immediate safety hazards
2. Assess equipment stability and structural integrity
3. Check for electrical safety issues
4. Evaluate user safety risks

## MAINTENANCE PRIORITY
1. Determine maintenance urgency
2. Assess repair complexity
3. Estimate repair costs and time
4. Recommend immediate actions

Please provide your analysis in the following JSON format:
{
  "equipment": {
    "type": "string",
    "confidence": number,
    "brand": "string",
    "model": "string",
    "category": "string",
    "components": ["array of visible components"]
  },
  "damage": {
    "severity": "LOW|MEDIUM|HIGH|CRITICAL",
    "types": ["array of damage types"],
    "components": ["array of affected components"],
    "safetyHazards": ["array of safety hazards"]
  },
  "analysis": {
    "description": "detailed description of what you see",
    "mainIssue": "main problem identified",
    "causes": ["potential causes"],
    "safetyLevel": "SAFE|MODERATE|UNSAFE",
    "maintenancePriority": "LOW|MEDIUM|HIGH|CRITICAL",
    "immediateActions": ["list of immediate actions needed"],
    "repairEstimate": {
      "time": "estimated repair time",
      "complexity": "LOW|MEDIUM|HIGH",
      "cost": "estimated cost range"
    }
  }
}`;console.log("Starting enhanced AI analysis for equipment recognition and damage detection");const s=await fetch("https://api.grok.x.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify({model:"grok-beta",messages:[{role:"user",content:[{type:"text",text:a},{type:"image_url",image_url:{url:e}}]}],max_tokens:2e3})});if(!s.ok){const w=await s.text();throw console.error("Enhanced AI analysis error:",s.status,w),new Error(`Enhanced AI analysis error: ${s.status}`)}const c=(await s.json()).choices[0].message.content;let h=null;try{const w=c.match(/\{[\s\S]*\}/);if(w)h=JSON.parse(w[0]);else throw new Error("No JSON found in response")}catch(w){console.warn("Failed to parse JSON response, using text analysis:",w),h={equipment:{type:"Unknown",confidence:0,brand:"Unknown",model:"Unknown"},damage:{severity:"UNKNOWN",types:[],components:[],safetyHazards:[]},analysis:{description:c,mainIssue:"Analysis completed",safetyLevel:"UNKNOWN"}}}const{error:I}=await y.from("photos").insert({user_id:"current-user",photo_url:e,task_id:l.selectedTaskId||null,response:JSON.stringify(h),purpose:"enhanced_analysis",upload_type:o,created_at:new Date().toISOString()});return I&&console.error("Error saving enhanced analysis:",I),await Ce(h,e),console.log("Enhanced AI analysis completed:",h),h}catch(r){throw console.error("Error in enhanced AI analysis:",r),r}},Ce=async(e,o)=>{try{if(console.log("🔄 Starting automated task generation from photo analysis"),!e||!e.damage||!e.analysis){console.warn("Insufficient analysis data for task generation");return}const r=[],a=new Date().toISOString();let s=T.find(i=>i.name.toLowerCase().includes(e.equipment.type.toLowerCase())||i.type.toLowerCase().includes(e.equipment.type.toLowerCase()));if(!s){const{data:i,error:c}=await y.from("equipment").insert({name:`${e.equipment.brand||"Unknown"} ${e.equipment.type}`,type:e.equipment.type,brand:e.equipment.brand||"Unknown",model:e.equipment.model||"Unknown",category:e.equipment.category||"Unknown",status:"active",last_maintenance:null,photo_url:o,ai_detected:!0,created_at:a}).select().single();!c&&i&&(s=i,console.log("Created new equipment record:",i),await ne())}if(e.damage.severity==="CRITICAL"){const i={task_list:`URGENT: ${e.equipment.type} - ${e.analysis.mainIssue}`,description:`Critical safety issue detected: ${e.analysis.description}`,priority:"high",status:"pending",due_date:new Date(Date.now()+864e5).toISOString(),equipment_id:(s==null?void 0:s.id)||e.equipment.type,photo_url:o,ai_generated:!0,severity:"CRITICAL",immediate_actions:e.analysis.immediateActions,created_at:a};r.push(i)}if(e.damage.types&&e.damage.types.length>0&&e.damage.types.forEach(i=>{const c={task_list:`Repair ${e.equipment.type} - ${i}`,description:`Address ${i} on ${e.equipment.type}. ${e.analysis.description}`,priority:e.damage.severity==="HIGH"?"high":"medium",status:"pending",due_date:new Date(Date.now()+6048e5).toISOString(),equipment_id:(s==null?void 0:s.id)||e.equipment.type,photo_url:o,ai_generated:!0,severity:e.damage.severity,damage_type:i,affected_components:e.damage.components,created_at:a};r.push(c)}),e.analysis.immediateActions&&e.analysis.immediateActions.length>0&&e.analysis.immediateActions.forEach(i=>{const c={task_list:`Immediate Action: ${i}`,description:`Perform immediate action: ${i}. Equipment: ${e.equipment.type}`,priority:"high",status:"pending",due_date:new Date(Date.now()+1728e5).toISOString(),equipment_id:(s==null?void 0:s.id)||e.equipment.type,photo_url:o,ai_generated:!0,action_type:"immediate",created_at:a};r.push(c)}),e.analysis.maintenancePriority!=="LOW"){const i={task_list:`Schedule Maintenance: ${e.equipment.type}`,description:`Schedule maintenance for ${e.equipment.type} based on AI analysis. Priority: ${e.analysis.maintenancePriority}`,priority:e.analysis.maintenancePriority==="HIGH"?"high":"medium",status:"pending",due_date:new Date(Date.now()+12096e5).toISOString(),equipment_id:(s==null?void 0:s.id)||e.equipment.type,photo_url:o,ai_generated:!0,maintenance_type:"scheduled",repair_estimate:e.analysis.repairEstimate,created_at:a};r.push(i)}if(r.length>0){const{data:i,error:c}=await y.from("tasks").insert(r).select();c?console.error("Error saving generated tasks:",c):(console.log(`✅ Successfully generated ${r.length} tasks from photo analysis`),f("success",`Generated ${r.length} maintenance tasks from analysis`),await ie())}return r}catch(r){console.error("Error generating tasks from analysis:",r),f("error","Failed to generate tasks from analysis")}},je=()=>{try{const e=localStorage.getItem("offlinePhotos");if(e){const o=JSON.parse(e);F(o),console.log(`Loaded ${o.length} offline photos`)}}catch(e){console.error("Error loading offline photos:",e)}},de=async(e,o="clarification")=>{try{const r=new FileReader;r.onload=a=>{const s={id:`offline_${Date.now()}`,file:a.target.result,name:e.name,purpose:o,created_at:new Date().toISOString(),status:"pending_upload",annotations:[]},i=[...L,s];F(i),localStorage.setItem("offlinePhotos",JSON.stringify(i)),console.log("Photo saved offline:",s.id),f("success","Photo saved offline - will upload when online")},r.readAsDataURL(e)}catch(r){console.error("Error saving offline photo:",r),f("error","Failed to save photo offline")}},Ee=async()=>{if(L.length!==0){console.log(`🔄 Syncing ${L.length} offline photos...`);for(const e of L)try{const r=await(await fetch(e.file)).blob(),a=new File([r],e.name,{type:"image/jpeg"}),s=`project-photos/${Date.now()}_${e.name}`,{data:i,error:c}=await y.storage.from("photos").upload(s,a);if(c)throw c;const{data:{publicUrl:h}}=y.storage.from("photos").getPublicUrl(s);e.purpose==="enhanced_analysis"?await ce(h,"file"):await le(h,"file",e.purpose),console.log(`✅ Synced offline photo: ${e.id}`)}catch(o){console.error(`❌ Failed to sync offline photo ${e.id}:`,o)}F([]),localStorage.removeItem("offlinePhotos"),f("success","All offline photos synced successfully")}},Ne=async e=>{try{const{error:o}=await y.from("photos").delete().eq("id",e);if(o)throw o;S(m.filter(r=>r.id!==e)),console.log(`Photo ${e} deleted`),f("success","Photo deleted")}catch(o){console.error("Error deleting photo:",o),f("error","Failed to delete photo")}},Te=e=>e.includes("✅ Work Complete and Correct")||e.includes("✅ Complete and Correct")?t.jsx(Ye,{size:16,style:{color:"var(--success-color)"}}):e.includes("⚠️ Work Needs Attention")||e.includes("⚠️ Needs Attention")?t.jsx(Je,{size:16,style:{color:"var(--warning-text)"}}):e.includes("❌ Work Incomplete")||e.includes("🔄 In Progress")?t.jsx(Qe,{size:16,style:{color:"var(--primary-color)"}}):t.jsx(Ke,{size:16}),Pe=e=>e.includes("✅ Work Complete and Correct")||e.includes("✅ Complete and Correct")?"var(--success-color)":e.includes("⚠️ Work Needs Attention")||e.includes("⚠️ Needs Attention")?"var(--warning-color)":e.includes("❌ Work Incomplete")||e.includes("🔄 In Progress")?"var(--primary-color)":"var(--secondary-color)",Re=e=>e==="camera"?t.jsx(U,{size:14}):t.jsx(W,{size:14}),f=(e,o)=>{u({type:e,text:o}),setTimeout(()=>u({type:"",text:""}),5e3)},_e=()=>{if(!("webkitSpeechRecognition"in window)&&!("SpeechRecognition"in window)){f("error","Speech recognition not supported");return}const e=window.SpeechRecognition||window.webkitSpeechRecognition,o=new e;o.continuous=!1,o.interimResults=!0,o.lang="en-US",o.onstart=()=>{R(!0),V("")},o.onresult=a=>{let s="";for(let i=a.resultIndex;i<a.results.length;i++)a.results[i].isFinal&&(s+=a.results[i][0].transcript);s&&(V(s),De(s))},o.onend=()=>{R(!1)},o.onerror=a=>{console.error("Speech recognition error:",a.error),R(!1)};const r=setTimeout(()=>{o.stop(),o.abort()},3e4);J(r),o.start()},Me=()=>{Y&&(clearTimeout(Y),J(null));try{window.speechRecognition&&(window.speechRecognition.stop(),window.speechRecognition.abort())}catch{console.log("Recognition already stopped")}R(!1),f("info","Voice input stopped.")},De=e=>{var r,a;const o=e.toLowerCase();if(o.includes("describe")||o.includes("analyze"))d(s=>({...s,analysis:s.analysis+`

Voice Description: `+e}));else if(o.includes("tag")||o.includes("label")){const s=((a=(r=e.match(/(?:tag|label)\s+(.+)/i))==null?void 0:r[1])==null?void 0:a.split(/\s+and\s+|\s*,\s*/))||[];xe(i=>[...i,...s])}else o.includes("purpose")&&(o.includes("clarification")?d(s=>({...s,purpose:"clarification"})):o.includes("next steps")||o.includes("next step")?d(s=>({...s,purpose:"next_steps"})):(o.includes("verify")||o.includes("done"))&&d(s=>({...s,purpose:"verify_done"})))},Le=()=>{Q(!0),_("")},pe=()=>{Q(!1),_(""),C&&(C.stop(),C.abort())},qe=()=>{if(!("webkitSpeechRecognition"in window)&&!("SpeechRecognition"in window)){f("error","Speech recognition not supported");return}const e=window.SpeechRecognition||window.webkitSpeechRecognition,o=new e;o.continuous=!1,o.interimResults=!0,o.lang="en-US",o.onstart=()=>{D(!0)},o.onresult=r=>{let a="";for(let s=r.resultIndex;s<r.results.length;s++)r.results[s].isFinal&&(a+=r.results[s][0].transcript);a&&_(s=>s+a+" ")},o.onend=()=>{D(!1)},o.onerror=r=>{console.error("Speech recognition error:",r.error),D(!1)},o.start(),ge(o)},ze=()=>{C&&(C.stop(),C.abort(),D(!1))},Oe=()=>{A.trim()&&(d(e=>({...e,analysis:e.analysis+`

Voice Description: `+A.trim()})),pe())},Ue=async()=>{try{console.log("Perplexity API key not configured");return}catch(e){console.error("Error generating AI suggestions:",e)}};return n.useEffect(()=>{if(!N.trim())X(m);else{const e=m.filter(o=>{var r,a;return((r=o.analysis)==null?void 0:r.toLowerCase().includes(N.toLowerCase()))||((a=o.purpose)==null?void 0:a.toLowerCase().includes(N.toLowerCase()))});X(e)}},[N,m]),t.jsxs("div",{className:"container",children:[!j&&t.jsx("div",{className:"offline-alert",children:"⚠️ You are currently offline. Some features may not work properly."}),p.text&&t.jsx("div",{className:`message ${p.type}`,children:p.text}),t.jsxs("div",{className:"card",children:[t.jsx("h3",{children:"Upload Photo for Project Analysis"}),t.jsx("p",{style:{color:"var(--secondary-color)",marginBottom:"1rem"},children:"Upload a photo to get clarification, next steps, or verify if work is done correctly."}),l.showForm?t.jsxs("div",{children:[t.jsx("div",{style:{display:"flex",gap:"1rem",marginBottom:"1rem"},children:t.jsxs("button",{className:"btn btn-secondary",onClick:()=>{stopCamera(),d({...l,showForm:!1,photo:null,photoUrl:"",analysis:"",selectedTaskId:"",uploadMode:"file",uploadType:"file",purpose:"clarification"})},children:[t.jsx(We,{size:16,style:{marginRight:"0.5rem"}}),"Cancel"]})}),t.jsxs("fieldset",{className:"form-group",style:{marginBottom:"1rem",border:"none",padding:"0"},children:[t.jsx("legend",{className:"form-label",style:{padding:"0",marginBottom:"0.5rem"},children:"Upload Method"}),t.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap"},children:[t.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer",padding:"0.5rem 1rem",borderRadius:"6px",border:`2px solid ${l.uploadMode==="camera"?"var(--primary-color)":"var(--border-color)"}`,backgroundColor:l.uploadMode==="camera"?"var(--primary-color)":"transparent",color:l.uploadMode==="camera"?"white":"var(--text-color)",transition:"all 0.2s ease"},children:[t.jsx("input",{type:"radio",name:"uploadMode",value:"camera",checked:l.uploadMode==="camera",onChange:e=>q(e.target.value),style:{display:"none"},"aria-labelledby":"camera-option"}),t.jsx(U,{size:16,"aria-hidden":"true"}),t.jsx("span",{id:"camera-option",children:"Use Camera"})]}),t.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer",padding:"0.5rem 1rem",borderRadius:"6px",border:`2px solid ${l.uploadMode==="file"?"var(--primary-color)":"var(--border-color)"}`,backgroundColor:l.uploadMode==="file"?"var(--primary-color)":"transparent",color:l.uploadMode==="file"?"white":"var(--text-color)",transition:"all 0.2s ease"},children:[t.jsx("input",{type:"radio",name:"uploadMode",value:"file",checked:l.uploadMode==="file",onChange:e=>q(e.target.value),style:{display:"none"},"aria-labelledby":"file-option"}),t.jsx(W,{size:16,"aria-hidden":"true"}),t.jsx("span",{id:"file-option",children:"Upload File"})]})]})]}),t.jsxs("div",{className:"form-group",style:{marginBottom:"1rem"},children:[t.jsx("label",{className:"form-label",htmlFor:"analysis-purpose",children:"Analysis Purpose"}),t.jsxs("select",{id:"analysis-purpose",name:"analysis-purpose",className:"form-input",value:l.purpose,onChange:e=>d({...l,purpose:e.target.value}),children:[t.jsx("option",{value:"clarification",children:"🔍 Clarification - Describe the issue"}),t.jsx("option",{value:"next_steps",children:"➡️ Next Steps - Give instructions"}),t.jsx("option",{value:"verify_done",children:"✅ Verify Done - Confirm if work is correct"})]})]}),l.cameraMode&&t.jsxs("div",{style:{marginBottom:"1rem"},children:[t.jsx("video",{ref:x.videoRef,autoPlay:!0,playsInline:!0,style:{width:"100%",maxWidth:"400px",borderRadius:"8px",border:"2px solid var(--border-color)"}}),t.jsx("canvas",{ref:x.canvasRef,style:{display:"none"}}),t.jsx("div",{style:{marginTop:"1rem"},children:t.jsxs("button",{className:"btn",onClick:x.capturePhoto,style:{marginRight:"1rem"},title:"Capture photo with camera","aria-label":"Capture photo with camera",children:[t.jsx(U,{size:16,style:{marginRight:"0.5rem"},"aria-hidden":"true"}),"Capture Photo"]})})]}),t.jsxs("div",{className:"form-group",children:[t.jsx("label",{className:"form-label",htmlFor:"task-select-photos",children:"Link to Task (optional)"}),t.jsxs("select",{id:"task-select-photos",name:"task-select-photos",className:"form-input",value:l.selectedTaskId,onChange:e=>d({...l,selectedTaskId:e.target.value}),children:[t.jsx("option",{value:"",children:"Select a task..."}),g.map(e=>t.jsxs("option",{value:e.id,children:[e.task_list," (",e.status,")"]},e.id))]})]}),!l.cameraMode&&t.jsxs("div",{className:"form-group",children:[t.jsx("label",{className:"form-label",htmlFor:"photo-file-upload",children:"Upload Photo"}),t.jsx("input",{id:"photo-file-upload",name:"photo-file-upload",type:"file",accept:"image/*",onChange:Ae,className:"form-input",disabled:l.loading})]}),l.photo&&t.jsx("div",{style:{marginTop:"1rem"},children:t.jsx("img",{src:URL.createObjectURL(l.photo),alt:"Uploaded",style:{maxWidth:"100%",maxHeight:"200px",borderRadius:"8px"}})}),l.loading&&t.jsxs("div",{style:{marginTop:"1rem",textAlign:"center"},children:[t.jsx(G,{size:20,style:{animation:"spin 1s linear infinite",marginRight:"0.5rem"}}),"Analyzing photo for ",re(l.purpose),"..."]}),l.analysis&&t.jsx("div",{style:{marginTop:"1rem"},children:t.jsx("div",{style:{backgroundColor:"var(--light-color)",padding:"1rem",borderRadius:"8px",whiteSpace:"pre-wrap",fontFamily:"monospace",fontSize:"0.9rem",border:"2px solid var(--primary-color)"},children:l.analysis})})]}):t.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap"},children:[x.isAvailable&&t.jsxs("button",{className:"btn",onClick:()=>{q("camera"),Ie()},title:"Use camera to take photo","aria-label":"Use camera to take photo",children:[t.jsx(U,{size:16,style:{marginRight:"0.5rem"},"aria-hidden":"true"}),"Use Camera"]}),t.jsxs("button",{className:"btn",onClick:()=>{q("file"),d(e=>({...e,showForm:!0}))},title:"Upload photo from file","aria-label":"Upload photo from file",children:[t.jsx(W,{size:16,style:{marginRight:"0.5rem"},"aria-hidden":"true"}),"Upload File"]})]})]}),t.jsxs("div",{className:"card",children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},children:[t.jsx("h3",{children:"Project Photos"}),t.jsxs("button",{className:"btn btn-secondary",onClick:z,disabled:v,title:"Refresh photos","aria-label":"Refresh photos",children:[t.jsx(Ge,{size:16,style:{marginRight:"0.5rem"},"aria-hidden":"true"}),"Refresh"]})]}),v&&m.length===0?t.jsx("div",{className:"loading",children:"Loading photos..."}):m.length===0?t.jsx("p",{style:{textAlign:"center",color:"var(--secondary-color)"},children:"No photos uploaded yet. Upload a photo above to get started!"}):t.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:m.map(e=>{const o=g.find(r=>r.id===e.task_id);return t.jsxs("div",{style:{border:"1px solid var(--border-color)",borderRadius:"8px",padding:"1rem",backgroundColor:"var(--light-color)"},children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"},children:[t.jsxs("div",{style:{flex:1},children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"},children:[Te(e.response),t.jsx("span",{style:{fontWeight:"600",color:Pe(e.response)},children:"Project Photo"}),t.jsx("span",{style:{fontSize:"0.8rem",color:"var(--secondary-color)"},children:new Date(e.created_at).toLocaleDateString()}),e.purpose&&t.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"0.25rem",fontSize:"0.8rem",marginLeft:"0.5rem",padding:"0.25rem 0.5rem",backgroundColor:"var(--primary-color)",color:"white",borderRadius:"4px"},children:[Se(e.purpose),re(e.purpose)]}),e.upload_type&&t.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"0.25rem",fontSize:"0.8rem",color:"var(--primary-color)",marginLeft:"0.5rem"},children:[Re(e.upload_type),e.upload_type]})]}),o&&t.jsxs("div",{style:{fontSize:"0.9rem",color:"var(--primary-color)",marginBottom:"0.5rem"},children:["📋 Linked to: ",o.task_list]})]}),t.jsx("button",{className:"btn btn-danger",onClick:()=>Ne(e.id),style:{padding:"0.25rem 0.5rem",fontSize:"0.8rem"},title:"Delete photo","aria-label":"Delete photo",children:t.jsx(He,{size:14,"aria-hidden":"true"})})]}),t.jsxs("div",{style:{display:"flex",gap:"1rem",marginBottom:"1rem"},children:[t.jsx("img",{src:e.photo_url,alt:"Project",style:{width:"120px",height:"120px",objectFit:"cover",borderRadius:"6px",border:"2px solid var(--border-color)"}}),t.jsx("div",{style:{flex:1},children:t.jsx("div",{style:{backgroundColor:"white",padding:"0.75rem",borderRadius:"6px",whiteSpace:"pre-wrap",fontFamily:"monospace",fontSize:"0.85rem",maxHeight:"120px",overflow:"auto",border:"2px solid var(--primary-color)"},children:e.response})})]})]},e.id)})}),oe&&m.length>0&&t.jsx("button",{onClick:ke,disabled:v,className:"btn btn-primary",style:{display:"block",margin:"1rem auto",padding:"0.75rem 2rem",fontSize:"1rem"},children:v?"Loading...":"Load More Photos"})]}),t.jsxs("div",{style:{marginTop:"1rem",padding:"1rem",backgroundColor:b?"var(--warning-color)":"var(--light-color)",borderRadius:"8px",border:b?"2px solid var(--warning-color)":"1px solid var(--border-color)",textAlign:"center"},children:[t.jsxs("h4",{style:{marginBottom:"0.5rem",color:b?"white":"var(--primary-color)",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"},children:[t.jsx(H,{size:20}),"Voice Photo Description"]}),t.jsxs("div",{style:{display:"flex",gap:"1rem",justifyContent:"center",marginBottom:"1rem"},children:[t.jsx("button",{onClick:b?Me:_e,style:{padding:"1rem 2rem",borderRadius:"50px",border:"none",backgroundColor:b?"#dc3545":"var(--primary-color)",color:"white",cursor:"pointer",fontSize:"1.1rem",fontWeight:"600",display:"flex",alignItems:"center",gap:"0.5rem",transition:"all 0.3s ease",boxShadow:b?"0 0 20px rgba(220, 53, 69, 0.5)":"0 2px 8px rgba(0,0,0,0.1)",animation:b?"pulse 2s infinite":"none"},children:b?t.jsxs(t.Fragment,{children:[t.jsx(ue,{size:20}),"STOP LISTENING"]}):t.jsxs(t.Fragment,{children:[t.jsx(H,{size:20}),"Quick Voice"]})}),t.jsxs("button",{onClick:Le,style:{padding:"1rem 2rem",borderRadius:"50px",border:"2px solid var(--primary-color)",backgroundColor:"white",color:"var(--primary-color)",cursor:"pointer",fontSize:"1.1rem",fontWeight:"600",display:"flex",alignItems:"center",gap:"0.5rem",transition:"all 0.3s ease"},children:[t.jsx(Be,{size:20}),"Voice Modal"]})]}),b&&t.jsx("div",{style:{color:"white",fontSize:"0.9rem",marginBottom:"0.5rem",textAlign:"center",fontWeight:"600"},children:'🎤 LISTENING - Click "STOP LISTENING" to stop'}),B&&t.jsxs("div",{style:{marginTop:"0.5rem",padding:"0.5rem",backgroundColor:"white",borderRadius:"4px",fontSize:"0.9rem",color:"var(--text-color)",minHeight:"40px"},children:[t.jsx("strong",{children:"You said:"})," ",B]})]}),t.jsx("div",{style:{marginTop:"1rem",padding:"1rem",backgroundColor:"var(--light-color)",borderRadius:"8px"},children:t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},children:[t.jsx("h4",{style:{color:"var(--primary-color)",margin:0},children:"🔍 Search Photos"}),t.jsxs("div",{style:{display:"flex",gap:"0.5rem",alignItems:"center"},children:[t.jsx(Ve,{size:16}),t.jsx("input",{type:"text",value:N,onChange:e=>ve(e.target.value),placeholder:"Search photos by analysis or purpose...",style:{padding:"0.5rem",borderRadius:"4px",border:"1px solid var(--border-color)",fontSize:"0.9rem",minWidth:"200px"}})]})]})}),t.jsxs("div",{style:{marginTop:"1rem",padding:"1rem",backgroundColor:"var(--light-color)",borderRadius:"8px"},children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},children:[t.jsx("h4",{style:{color:"var(--primary-color)",margin:0},children:"🤖 AI Photo Suggestions"}),t.jsxs("button",{onClick:Ue,style:{padding:"0.5rem 1rem",borderRadius:"4px",border:"1px solid var(--border-color)",backgroundColor:"var(--primary-color)",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem"},children:[t.jsx(G,{size:16}),"Get AI Suggestions"]})]}),K.length>0&&t.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:K.map((e,o)=>t.jsxs("div",{style:{padding:"0.75rem",backgroundColor:"white",borderRadius:"6px",border:"1px solid var(--border-color)"},children:[t.jsx("div",{style:{fontWeight:"500",marginBottom:"0.25rem"},children:e.suggestion}),t.jsx("div",{style:{fontSize:"0.8rem",color:"var(--secondary-color)"},children:e.reason})]},o))})]}),he&&t.jsx("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(0, 0, 0, 0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3},children:t.jsxs("div",{style:{backgroundColor:"white",padding:"2rem",borderRadius:"12px",width:"90%",maxWidth:"500px",boxShadow:"0 10px 25px rgba(0, 0, 0, 0.2)"},children:[t.jsx("h3",{style:{marginBottom:"1rem",color:"var(--primary-color)"},children:"🎤 Voice Photo Description"}),t.jsx("div",{style:{marginBottom:"1rem"},children:t.jsx("textarea",{value:A,onChange:e=>_(e.target.value),placeholder:"Your voice input will appear here...",style:{width:"100%",minHeight:"100px",padding:"0.75rem",borderRadius:"8px",border:"1px solid var(--border-color)",fontSize:"0.9rem",resize:"vertical"}})}),t.jsxs("div",{style:{display:"flex",gap:"0.5rem",justifyContent:"center"},children:[t.jsxs("button",{onClick:M?ze:qe,style:{padding:"0.75rem 1.5rem",borderRadius:"8px",border:"none",backgroundColor:M?"#dc3545":"var(--primary-color)",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem"},children:[M?t.jsx(ue,{size:16}):t.jsx(H,{size:16}),M?"Stop":"Start"," Recording"]}),t.jsx("button",{onClick:Oe,disabled:!A.trim(),style:{padding:"0.75rem 1.5rem",borderRadius:"8px",border:"none",backgroundColor:A.trim()?"var(--success-color)":"var(--secondary-color)",color:"white",cursor:A.trim()?"pointer":"not-allowed"},children:"Add Description"}),t.jsx("button",{onClick:pe,style:{padding:"0.75rem 1.5rem",borderRadius:"8px",border:"1px solid var(--border-color)",backgroundColor:"white",color:"var(--text-color)",cursor:"pointer"},children:"Cancel"})]})]})}),t.jsx("style",{jsx:!0,children:`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `})]})};export{yt as default};
//# sourceMappingURL=Photos-Bd5V8Yum.js.map
