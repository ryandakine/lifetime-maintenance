import{j as e}from"./jsx-runtime-Bywvkw1S.js";import{r as i,R as N}from"./index-CleY8y_P.js";import"./_commonjsHelpers-Cpj98o6Y.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var _={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),o=(r,x)=>{const a=i.forwardRef(({color:c="currentColor",size:s=24,strokeWidth:d=2,absoluteStrokeWidth:k,className:f="",children:l,...p},b)=>i.createElement("svg",{ref:b,..._,width:s,height:s,stroke:c,strokeWidth:k?Number(d)*24/Number(s):d,className:["lucide",`lucide-${V(r)}`,f].join(" "),...p},[...x.map(([n,j])=>i.createElement(n,j)),...Array.isArray(l)?l:[l]]));return a.displayName=`${r}`,a};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=o("AlertTriangle",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",key:"c3ski4"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=o("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=o("Circle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=o("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=o("PenSquare",[["path",{d:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1qinfi"}],["path",{d:"M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z",key:"w2jsv5"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=o("Save",[["path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",key:"1owoqh"}],["polyline",{points:"17 21 17 13 7 13 7 21",key:"1md35c"}],["polyline",{points:"7 3 7 8 15 8",key:"8nz8an"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=o("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=o("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),C=N.memo(({task:r,onToggle:x,onDelete:a,onEdit:c,onSaveEdit:s,editingId:d,editText:k,setEditText:f,isMobile:l})=>{const p=i.useMemo(()=>({high:"#ef4444",medium:"#f59e0b",low:"#10b981"}),[]),b=i.useMemo(()=>({high:e.jsx($,{size:16}),medium:e.jsx(G,{size:16}),low:e.jsx(v,{size:16})}),[]),n=d===r.id;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",padding:"1rem",backgroundColor:r.checked?"#f8f9fa":"white",border:"1px solid #e9ecef",borderRadius:"8px",marginBottom:"0.5rem",opacity:r.checked?.7:1,transition:"all 0.2s ease"},children:[e.jsx("div",{style:{color:p[r.priority]||"#6c757d",display:"flex",alignItems:"center"},children:b[r.priority]||e.jsx(v,{size:16})}),e.jsx("button",{onClick:()=>x(r.id),style:{background:"none",border:"none",cursor:"pointer",color:r.checked?"#10b981":"#6c757d",display:"flex",alignItems:"center"},children:r.checked?e.jsx(B,{size:20}):e.jsx(v,{size:20})}),e.jsx("div",{style:{flex:1},children:n?e.jsx("input",{type:"text",value:k,onChange:j=>f(j.target.value),style:{width:"100%",padding:"0.5rem",border:"1px solid #007bff",borderRadius:"4px",fontSize:"1rem"},autoFocus:!0}):e.jsxs("div",{children:[e.jsx("div",{style:{textDecoration:r.checked?"line-through":"none",color:r.checked?"#6c757d":"#212529",fontSize:"1rem",fontWeight:"500",marginBottom:"0.25rem"},children:r.description}),e.jsxs("div",{style:{display:"flex",gap:"1rem",fontSize:"0.8rem",color:"#6c757d",flexWrap:"wrap"},children:[e.jsx("span",{style:{backgroundColor:p[r.priority]||"#6c757d",color:"white",padding:"0.2rem 0.5rem",borderRadius:"12px",fontSize:"0.7rem",textTransform:"uppercase"},children:r.priority||"medium"}),r.category&&e.jsx("span",{style:{backgroundColor:"#e9ecef",color:"#495057",padding:"0.2rem 0.5rem",borderRadius:"12px",fontSize:"0.7rem"},children:r.category}),r.daysElapsed>0&&e.jsxs("span",{style:{backgroundColor:r.daysElapsed>7?"#fff3cd":"#d1ecf1",color:r.daysElapsed>7?"#856404":"#0c5460",padding:"0.2rem 0.5rem",borderRadius:"12px",fontSize:"0.7rem"},children:[r.daysElapsed," day",r.daysElapsed!==1?"s":""," old"]})]})]})}),e.jsx("div",{style:{display:"flex",gap:"0.5rem",opacity:n?0:1,transition:"opacity 0.2s ease"},children:n?e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>s(r.id),style:{background:"none",border:"none",cursor:"pointer",color:"#10b981",padding:"0.25rem"},children:e.jsx(Z,{size:16})}),e.jsx("button",{onClick:()=>c(null),style:{background:"none",border:"none",cursor:"pointer",color:"#6c757d",padding:"0.25rem"},children:e.jsx(K,{size:16})})]}):e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>c(r.id),style:{background:"none",border:"none",cursor:"pointer",color:"#007bff",padding:"0.25rem"},children:e.jsx(W,{size:16})}),e.jsx("button",{onClick:()=>a(r.id),style:{background:"none",border:"none",cursor:"pointer",color:"#dc3545",padding:"0.25rem"},children:e.jsx(X,{size:16})})]})})]})});C.displayName="TaskItem";C.__docgenInfo={description:"",methods:[],displayName:"TaskItem"};const U={title:"Tasks/TaskItem",component:C,parameters:{layout:"centered"},tags:["autodocs"]},h={id:"1",description:"Sample Task Description",priority:2,category:"General",checked:!1,daysElapsed:0},t={args:{task:h,onToggle:()=>console.log("Toggled"),onDelete:()=>console.log("Deleted"),onEdit:()=>console.log("Edit")}},m={args:{task:{...h,priority:1,description:"Fix Gas Leak ASAP"}}},g={args:{task:{...h,priority:3,description:"Paint Shed Eventually"}}},y={args:{task:{...h,checked:!0}}},u={args:{...t.args,editingId:"1",editText:"Sample Task Description"}};var T,S,w;t.parameters={...t.parameters,docs:{...(T=t.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    task: baseTask,
    onToggle: () => console.log('Toggled'),
    onDelete: () => console.log('Deleted'),
    onEdit: () => console.log('Edit')
  }
}`,...(w=(S=t.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var z,E,I;m.parameters={...m.parameters,docs:{...(z=m.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    task: {
      ...baseTask,
      priority: 1,
      description: 'Fix Gas Leak ASAP'
    }
  }
}`,...(I=(E=m.parameters)==null?void 0:E.docs)==null?void 0:I.source}}};var M,A,D;g.parameters={...g.parameters,docs:{...(M=g.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    task: {
      ...baseTask,
      priority: 3,
      description: 'Paint Shed Eventually'
    }
  }
}`,...(D=(A=g.parameters)==null?void 0:A.docs)==null?void 0:D.source}}};var L,P,R;y.parameters={...y.parameters,docs:{...(L=y.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    task: {
      ...baseTask,
      checked: true
    }
  }
}`,...(R=(P=y.parameters)==null?void 0:P.docs)==null?void 0:R.source}}};var q,F,H;u.parameters={...u.parameters,docs:{...(q=u.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    editingId: '1',
    editText: 'Sample Task Description'
  }
}`,...(H=(F=u.parameters)==null?void 0:F.docs)==null?void 0:H.source}}};const Y=["Default","HighPriority","LowPriority","Completed","Editing"];export{y as Completed,t as Default,u as Editing,m as HighPriority,g as LowPriority,Y as __namedExportsOrder,U as default};
