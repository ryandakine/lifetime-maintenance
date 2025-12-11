import{j as s}from"./jsx-runtime-Bywvkw1S.js";import{R as x}from"./index-CleY8y_P.js";import"./_commonjsHelpers-Cpj98o6Y.js";const a=x.memo(({template:e,onSelect:n,isMobile:u})=>{const g=()=>{n&&n(e)};return s.jsxs("button",{onClick:g,style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.5rem",padding:"1rem",border:"1px solid #e9ecef",borderRadius:"8px",backgroundColor:"white",cursor:"pointer",transition:"all 0.2s ease",minWidth:u?"120px":"150px",textAlign:"center"},onMouseEnter:t=>{t.target.style.transform="translateY(-2px)",t.target.style.boxShadow="0 4px 12px rgba(0,0,0,0.15)"},onMouseLeave:t=>{t.target.style.transform="translateY(0)",t.target.style.boxShadow="none"},children:[s.jsx("div",{style:{fontSize:"2rem"},children:e.icon||"📋"}),s.jsx("div",{style:{fontWeight:"600",color:"#212529"},children:e.name}),s.jsx("div",{style:{fontSize:"0.8rem",color:"#6c757d"},children:e.description})]})});a.displayName="TaskTemplate";a.__docgenInfo={description:"",methods:[],displayName:"TaskTemplate"};const b={title:"Tasks/TaskTemplate",component:a,parameters:{layout:"centered"},tags:["autodocs"]},r={args:{template:{name:"Check Filters",description:"Replace HVAC filters",icon:"🌬️"},onSelect:e=>console.log("Selected",e)}},o={args:{...r.args,isMobile:!0}};var i,l,c;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    template: {
      name: 'Check Filters',
      description: 'Replace HVAC filters',
      icon: '🌬️'
    },
    onSelect: t => console.log('Selected', t)
  }
}`,...(c=(l=r.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var d,p,m;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    isMobile: true
  }
}`,...(m=(p=o.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};const k=["Default","MobileView"];export{r as Default,o as MobileView,k as __namedExportsOrder,b as default};
