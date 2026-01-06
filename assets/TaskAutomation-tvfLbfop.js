import{s as l,T as d,A as h,j as t}from"./main-D2OIwsnq.js";import{r as m}from"./vendor-B6114-rA.js";import{Z as F,g as B,Q as K,Y as q,m as G,j as H,X as W}from"./ui-7hvmghxF.js";import"./redux-CQk40qEf.js";const V=()=>{const[v,g]=m.useState([]),[S,y]=m.useState([]),[x,N]=m.useState([]),[_,b]=m.useState(!1),[A,u]=m.useState(!1),[c,p]=m.useState({name:"",trigger:"",action:"",conditions:[],enabled:!0});m.useEffect(()=>{T(),P(),I()},[]);const T=async()=>{try{const{data:e,error:s}=await l.from("task_automations").select("*").order("created_at",{ascending:!1});if(s)throw s;g(e||[])}catch(e){console.error("Error loading automations:",e),E()}},E=()=>{g([{id:1,name:"Morning Task Prioritization",trigger:"time:09:00",action:"prioritize_tasks",conditions:["workday"],enabled:!0,description:"Automatically prioritize tasks based on deadlines and importance"},{id:2,name:"Goal Progress Check",trigger:"weekly:monday",action:"check_goals",conditions:[],enabled:!0,description:"Weekly review of goal progress and adjustments"},{id:3,name:"Shopping List Sync",trigger:"task_completed:shopping",action:"sync_shopping",conditions:["has_shopping_items"],enabled:!0,description:"Sync completed shopping items with inventory"},{id:4,name:"Email Follow-up",trigger:"email_sent",action:"schedule_followup",conditions:["business_email"],enabled:!0,description:"Automatically schedule follow-up reminders for business emails"}])},P=async()=>{b(!0);try{const{data:e}=await l.from(d.TASKS).select("*").order("created_at",{ascending:!1}).limit(100);if(e&&e.length>0){const s=z(e);N(s);const o=O(s);y(o)}}catch(e){console.error("Error analyzing patterns:",e)}finally{b(!1)}},z=e=>{var k,w;const s=[],o={};e.forEach(r=>{const n=new Date(r.created_at).getHours();o[n]=(o[n]||0)+1});const i=Object.entries(o).sort(([,r],[,n])=>n-r).slice(0,3).map(([r,n])=>({hour:parseInt(r),count:n}));s.push({type:"time",name:"Peak Productivity Hours",data:i,suggestion:`You're most productive at ${(k=i[0])==null?void 0:k.hour}:00. Schedule important tasks during these hours.`});const a={};e.forEach(r=>{const n=C(r.task_list);a[n]=(a[n]||0)+1});const f=Object.entries(a).sort(([,r],[,n])=>n-r).slice(0,3).map(([r,n])=>({type:r,count:n}));s.push({type:"category",name:"Most Common Task Types",data:f,suggestion:`You frequently work on ${(w=f[0])==null?void 0:w.type} tasks. Consider batching similar tasks.`});const j=e.filter(r=>r.status==="completed").length/e.length;return s.push({type:"completion",name:"Task Completion Rate",data:{rate:j},suggestion:`Your completion rate is ${Math.round(j*100)}%. Focus on smaller, achievable tasks to improve this.`}),s},C=e=>{const s=e.toLowerCase();return s.includes("email")||s.includes("communication")?"Communication":s.includes("maintenance")||s.includes("repair")?"Maintenance":s.includes("shopping")||s.includes("purchase")?"Shopping":s.includes("meeting")||s.includes("call")?"Meetings":s.includes("document")||s.includes("report")?"Documentation":"Other"},O=e=>{const s=[];return e.forEach(o=>{var i,a;switch(o.type){case"time":s.push({id:Date.now()+Math.random(),title:"Smart Scheduling",description:o.suggestion,automation:{trigger:`time:${(i=o.data[0])==null?void 0:i.hour}:00`,action:"schedule_important_tasks",conditions:["workday"]}});break;case"category":s.push({id:Date.now()+Math.random(),title:"Task Batching",description:o.suggestion,automation:{trigger:"task_created",action:"suggest_batching",conditions:[`category:${(a=o.data[0])==null?void 0:a.type}`]}});break;case"completion":o.data.rate<.7&&s.push({id:Date.now()+Math.random(),title:"Break Down Tasks",description:o.suggestion,automation:{trigger:"task_created",action:"suggest_breakdown",conditions:["complex_task"]}});break}}),s},I=async()=>{try{const e=await fetch("https://api.perplexity.ai/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${h.PERPLEXITY_API_KEY}`},body:JSON.stringify({model:"gpt-4",messages:[{role:"user",content:`Based on these task patterns, suggest intelligent automations:
                Patterns: ${JSON.stringify(x)}
                
                Provide 3-5 specific automation suggestions that would:
                1. Save time on repetitive tasks
                2. Improve productivity
                3. Reduce cognitive load
                4. Ensure nothing falls through the cracks
                
                Format as JSON array with objects containing: title, description, trigger, action, conditions`}]})});if(e.ok){const s=await e.json(),o=JSON.parse(s.choices[0].message.content);y(i=>[...i,...o])}}catch(e){console.error("Error generating AI suggestions:",e)}},$=async()=>{try{const{data:e,error:s}=await l.from("task_automations").insert([c]);if(s)throw s;g(o=>[...o,{...c,id:e[0].id}]),p({name:"",trigger:"",action:"",conditions:[],enabled:!0}),u(!1)}catch(e){console.error("Error creating automation:",e)}},M=async(e,s)=>{try{const{error:o}=await l.from("task_automations").update({enabled:!s}).eq("id",e);if(o)throw o;g(i=>i.map(a=>a.id===e?{...a,enabled:!s}:a))}catch(o){console.error("Error toggling automation:",o)}},L=async e=>{switch(console.log(`Executing automation: ${e.name}`),e.action){case"prioritize_tasks":await R();break;case"check_goals":await J();break;case"sync_shopping":await D();break;case"schedule_followup":await Y();break;default:console.log("Unknown automation action:",e.action)}},R=async()=>{try{const{data:e}=await l.from(d.TASKS).select("*").eq("status","pending").order("created_at",{ascending:!1});if(e&&e.length>0){const s=await fetch("https://api.perplexity.ai/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${h.PERPLEXITY_API_KEY}`},body:JSON.stringify({model:"gpt-4",messages:[{role:"user",content:`Prioritize these tasks based on urgency, importance, and dependencies:
                  ${JSON.stringify(e)}
                  
                  Return a JSON array with task IDs in priority order.`}]})});if(s.ok){const o=await s.json(),i=JSON.parse(o.choices[0].message.content);for(let a=0;a<i.length;a++)await l.from(d.TASKS).update({priority:a+1}).eq("id",i[a])}}}catch(e){console.error("Error prioritizing tasks:",e)}},J=async()=>{try{const{data:e}=await l.from(d.GOALS).select("*").eq("completed",!1);if(e&&e.length>0){const s=await fetch("https://api.perplexity.ai/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${h.PERPLEXITY_API_KEY}`},body:JSON.stringify({model:"gpt-4",messages:[{role:"user",content:`Analyze these goals and provide actionable insights:
                  ${JSON.stringify(e)}
                  
                  Provide:
                  1. Progress assessment
                  2. Blockers identification
                  3. Next steps recommendations
                  4. Motivation boost
                  
                  Format as JSON object.`}]})});if(s.ok){const o=await s.json(),i=JSON.parse(o.choices[0].message.content);console.log("Goal insights:",i)}}}catch(e){console.error("Error checking goals:",e)}},D=async()=>{try{const{data:e}=await l.from(d.SHOPPING_LISTS).select("*").eq("status","completed");e&&e.length>0&&console.log("Syncing shopping lists:",e)}catch(e){console.error("Error syncing shopping:",e)}},Y=async()=>{try{const{data:e}=await l.from(d.EMAILS).select("*").eq("sent",!0).order("created_at",{ascending:!1}).limit(10);e&&e.length>0&&e.filter(o=>o.subject.toLowerCase().includes("business")||o.to_email.includes("@lifetime.com")).forEach(o=>{l.from(d.TASKS).insert([{task_list:`Follow up on: ${o.subject}`,status:"pending",priority:2,notes:`Follow up on email sent to ${o.to_email} on ${new Date(o.created_at).toLocaleDateString()}`}])})}catch(e){console.error("Error scheduling followup:",e)}};return t.jsxs("div",{className:"task-automation",children:[t.jsxs("div",{className:"automation-header",children:[t.jsxs("h2",{children:[t.jsx(F,{size:24})," Task Automation"]}),t.jsx("p",{children:"Intelligent automation to handle repetitive tasks and boost productivity"})]}),t.jsxs("div",{className:"automations-section",children:[t.jsxs("div",{className:"section-header",children:[t.jsx("h3",{children:"Active Automations"}),t.jsxs("button",{onClick:()=>u(!0),className:"add-btn",style:{background:"var(--primary-color)",color:"white",border:"none",padding:"0.5rem 1rem",borderRadius:"6px",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem"},children:[t.jsx(B,{size:16}),"Add Automation"]})]}),t.jsx("div",{className:"automations-grid",children:v.map(e=>t.jsxs("div",{className:"automation-card",children:[t.jsxs("div",{className:"automation-header",children:[t.jsx("h4",{children:e.name}),t.jsxs("div",{className:"automation-controls",children:[t.jsx("button",{onClick:()=>M(e.id,e.enabled),className:`toggle-btn ${e.enabled?"enabled":"disabled"}`,style:{background:e.enabled?"var(--success-color)":"var(--secondary-color)",color:"white",border:"none",padding:"0.25rem 0.5rem",borderRadius:"4px",cursor:"pointer",fontSize:"0.8rem"},children:e.enabled?"ON":"OFF"}),t.jsx("button",{onClick:()=>L(e),className:"execute-btn",style:{background:"var(--primary-color)",color:"white",border:"none",padding:"0.25rem 0.5rem",borderRadius:"4px",cursor:"pointer",fontSize:"0.8rem"},children:t.jsx(K,{size:12})})]})]}),t.jsx("p",{className:"automation-description",children:e.description}),t.jsxs("div",{className:"automation-details",children:[t.jsxs("span",{className:"trigger",children:["Trigger: ",e.trigger]}),t.jsxs("span",{className:"action",children:["Action: ",e.action]})]})]},e.id))})]}),t.jsxs("div",{className:"patterns-section",children:[t.jsxs("h3",{children:[t.jsx(q,{size:20})," Task Patterns"]}),_?t.jsxs("div",{className:"analyzing",children:[t.jsx(G,{size:20,style:{animation:"spin 1s linear infinite"}}),"Analyzing your task patterns..."]}):t.jsx("div",{className:"patterns-grid",children:x.map((e,s)=>t.jsxs("div",{className:"pattern-card",children:[t.jsx("h4",{children:e.name}),t.jsx("p",{children:e.suggestion}),e.type==="time"&&t.jsx("div",{className:"time-chart",children:e.data.map((o,i)=>t.jsxs("div",{className:"time-bar",children:[t.jsxs("span",{children:[o.hour,":00"]}),t.jsx("div",{className:"bar",style:{height:`${o.count/Math.max(...e.data.map(a=>a.count))*100}px`,background:"var(--primary-color)"}})]},i))})]},s))})]}),t.jsxs("div",{className:"suggestions-section",children:[t.jsxs("h3",{children:[t.jsx(H,{size:20})," Smart Suggestions"]}),t.jsx("div",{className:"suggestions-grid",children:S.map(e=>t.jsxs("div",{className:"suggestion-card",children:[t.jsx("h4",{children:e.title}),t.jsx("p",{children:e.description}),e.automation&&t.jsx("button",{onClick:()=>{p(e.automation),u(!0)},className:"create-automation-btn",style:{background:"var(--success-color)",color:"white",border:"none",padding:"0.5rem 1rem",borderRadius:"6px",cursor:"pointer",fontSize:"0.9rem"},children:"Create Automation"})]},e.id))})]}),A&&t.jsx("div",{className:"modal-overlay",children:t.jsxs("div",{className:"modal",children:[t.jsxs("div",{className:"modal-header",children:[t.jsx("h3",{children:"Create New Automation"}),t.jsx("button",{onClick:()=>u(!1),style:{background:"none",border:"none",cursor:"pointer"},children:t.jsx(W,{size:20})})]}),t.jsxs("div",{className:"modal-content",children:[t.jsxs("div",{className:"form-group",children:[t.jsx("label",{children:"Name"}),t.jsx("input",{type:"text",value:c.name,onChange:e=>p({...c,name:e.target.value}),placeholder:"Automation name"})]}),t.jsxs("div",{className:"form-group",children:[t.jsx("label",{children:"Trigger"}),t.jsxs("select",{value:c.trigger,onChange:e=>p({...c,trigger:e.target.value}),children:[t.jsx("option",{value:"",children:"Select trigger"}),t.jsx("option",{value:"time:09:00",children:"Daily at 9:00 AM"}),t.jsx("option",{value:"weekly:monday",children:"Weekly on Monday"}),t.jsx("option",{value:"task_completed",children:"When task is completed"}),t.jsx("option",{value:"email_sent",children:"When email is sent"})]})]}),t.jsxs("div",{className:"form-group",children:[t.jsx("label",{children:"Action"}),t.jsxs("select",{value:c.action,onChange:e=>p({...c,action:e.target.value}),children:[t.jsx("option",{value:"",children:"Select action"}),t.jsx("option",{value:"prioritize_tasks",children:"Prioritize tasks"}),t.jsx("option",{value:"check_goals",children:"Check goals"}),t.jsx("option",{value:"sync_shopping",children:"Sync shopping"}),t.jsx("option",{value:"schedule_followup",children:"Schedule follow-up"})]})]}),t.jsxs("div",{className:"modal-actions",children:[t.jsx("button",{onClick:()=>u(!1),className:"cancel-btn",children:"Cancel"}),t.jsx("button",{onClick:$,className:"create-btn",disabled:!c.name||!c.trigger||!c.action,children:"Create Automation"})]})]})]})}),t.jsx("style",{jsx:!0,children:`
        .automations-grid, .patterns-grid, .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .automation-card, .pattern-card, .suggestion-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
        }
        
        .automation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .automation-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .time-chart {
          display: flex;
          align-items: end;
          gap: 0.5rem;
          height: 60px;
          margin-top: 1rem;
        }
        
        .time-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .bar {
          width: 20px;
          border-radius: 2px;
          transition: height 0.3s ease;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .modal-content {
          padding: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        .cancel-btn {
          background: var(--secondary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .create-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .create-btn:disabled {
          background: var(--secondary-color);
          cursor: not-allowed;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `})]})};export{V as default};
//# sourceMappingURL=TaskAutomation-tvfLbfop.js.map
