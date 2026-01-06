import{A as n,j as e}from"./main-D2OIwsnq.js";import{r as o}from"./vendor-B6114-rA.js";import{p as x,_ as G,l as H,$ as A,a0 as T,a1 as C}from"./ui-7hvmghxF.js";import"./redux-CQk40qEf.js";const P=()=>{const[j,b]=o.useState([]),[d,f]=o.useState(null),[i,v]=o.useState({}),[y,w]=o.useState([]),[l,N]=o.useState([]),[m,p]=o.useState(!1),[h,k]=o.useState(null);o.useEffect(()=>{n.GITHUB_TOKEN&&g()},[]);const g=async()=>{p(!0);try{const r=await fetch("https://api.github.com/user/repos?sort=updated&per_page=10",{headers:{Authorization:`token ${n.GITHUB_TOKEN}`,Accept:"application/vnd.github.v3+json"}});if(!r.ok)throw new Error(`GitHub API error: ${r.status}`);const s=await r.json();b(s),s.length>0&&await _(s.slice(0,3))}catch(r){console.error("Error loading GitHub repos:",r),k("Failed to load repositories. Check your GitHub token.")}finally{p(!1)}},u=async r=>{try{const[s,a]=await Promise.all([fetch(`https://api.github.com/repos/${r}`,{headers:{Authorization:`token ${n.GITHUB_TOKEN}`,Accept:"application/vnd.github.v3+json"}}),fetch(`https://api.github.com/repos/${r}/commits?per_page=10`,{headers:{Authorization:`token ${n.GITHUB_TOKEN}`,Accept:"application/vnd.github.v3+json"}})]);if(s.ok&&a.ok){const t=await s.json(),E=await a.json();v(t),w(E),f(r)}}catch(s){console.error("Error loading repo stats:",s)}},_=async r=>{try{const s=[];for(const a of r){const t={repo:a.name,type:"activity",message:`Repository ${a.name} was last updated ${c(a.updated_at)}`,priority:a.stargazers_count>10?"high":"medium",action:"view_repo"};a.language&&s.push({repo:a.name,type:"language",message:`Primary language: ${a.language}`,priority:"low",action:"analyze_code"}),a.stargazers_count>0&&s.push({repo:a.name,type:"popularity",message:`${a.stargazers_count} stars - This repo is gaining attention!`,priority:"medium",action:"celebrate"}),s.push(t)}N(s)}catch(s){console.error("Error generating insights:",s)}},c=r=>{const s=new Date(r),t=Math.floor((new Date-s)/(1e3*60*60));return t<24?`${t} hours ago`:t<168?`${Math.floor(t/24)} days ago`:`${Math.floor(t/168)} weeks ago`},z=r=>r.commit.message.split(`
`)[0],R=r=>{var s;return r.commit.author.name||((s=r.author)==null?void 0:s.login)||"Unknown"},I=r=>e.jsxs("div",{className:"repo-card",onClick:()=>u(r.full_name),children:[e.jsxs("div",{className:"repo-header",children:[e.jsx("h4",{children:r.name}),e.jsxs("div",{className:"repo-stats",children:[e.jsxs("span",{className:"stat",children:[e.jsx(A,{size:14}),r.stargazers_count]}),e.jsxs("span",{className:"stat",children:[e.jsx(T,{size:14}),r.forks_count]}),e.jsxs("span",{className:"stat",children:[e.jsx(C,{size:14}),r.watchers_count]})]})]}),e.jsx("p",{className:"repo-description",children:r.description||"No description"}),e.jsxs("div",{className:"repo-meta",children:[r.language&&e.jsx("span",{className:"language",children:r.language}),e.jsxs("span",{className:"updated",children:["Updated ",c(r.updated_at)]})]}),e.jsx("div",{className:"repo-actions",children:e.jsx("button",{onClick:s=>{s.stopPropagation(),window.open(r.html_url,"_blank")},className:"view-btn",children:"View on GitHub"})})]},r.id),S=()=>!d||!i.id?null:e.jsxs("div",{className:"repo-stats-detail",children:[e.jsx("h3",{children:d}),e.jsxs("div",{className:"stats-grid",children:[e.jsxs("div",{className:"stat-card",children:[e.jsx("h4",{children:i.stargazers_count}),e.jsx("p",{children:"Stars"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h4",{children:i.forks_count}),e.jsx("p",{children:"Forks"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h4",{children:i.watchers_count}),e.jsx("p",{children:"Watchers"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("h4",{children:i.open_issues_count}),e.jsx("p",{children:"Open Issues"})]})]}),e.jsxs("div",{className:"commits-section",children:[e.jsx("h4",{children:"Recent Commits"}),y.map(r=>e.jsxs("div",{className:"commit-item",children:[e.jsxs("div",{className:"commit-info",children:[e.jsx("p",{className:"commit-message",children:z(r)}),e.jsx("p",{className:"commit-author",children:R(r)})]}),e.jsx("span",{className:"commit-date",children:c(r.commit.author.date)})]},r.sha))]})]}),$=()=>l.length===0?null:e.jsxs("div",{className:"insights-section",children:[e.jsxs("h3",{children:[e.jsx(H,{size:20})," Repository Insights"]}),e.jsx("div",{className:"insights-grid",children:l.map((r,s)=>e.jsxs("div",{className:`insight-card ${r.type}`,children:[e.jsxs("div",{className:"insight-header",children:[e.jsx("h4",{children:r.repo}),e.jsx("span",{className:`priority-badge ${r.priority}`,children:r.priority})]}),e.jsx("p",{children:r.message}),e.jsx("button",{onClick:()=>{r.action==="view_repo"&&u(r.repo)},className:"action-btn",children:r.action==="view_repo"?"View Details":"Take Action"})]},s))})]});return n.GITHUB_TOKEN?e.jsxs("div",{className:"github-integration",children:[e.jsxs("div",{className:"github-header",children:[e.jsxs("h2",{children:[e.jsx(G,{size:24})," GitHub Integration"]}),e.jsx("p",{children:"Smart insights and analytics for your repositories"})]}),h&&e.jsxs("div",{className:"error-alert",children:[e.jsx(x,{size:20}),h]}),e.jsxs("div",{className:"repos-section",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h3",{children:"Your Repositories"}),e.jsx("button",{onClick:g,className:"refresh-btn",disabled:m,children:m?"Loading...":"Refresh"})]}),e.jsx("div",{className:"repos-grid",children:j.map(I)})]}),S(),$(),e.jsx("style",{jsx:!0,children:`
        .repos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .repo-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .repo-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .repo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .repo-header h4 {
          margin: 0;
          color: var(--primary-color);
        }
        
        .repo-stats {
          display: flex;
          gap: 0.5rem;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .repo-description {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: var(--text-color);
        }
        
        .repo-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .language {
          background: var(--primary-color);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
        }
        
        .updated {
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .view-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }
        
        .stat-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }
        
        .stat-card h4 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--primary-color);
        }
        
        .stat-card p {
          margin: 0.25rem 0 0 0;
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .commits-section {
          margin-top: 1rem;
        }
        
        .commit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .commit-message {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .commit-author {
          margin: 0.25rem 0 0 0;
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .commit-date {
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .insight-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
        }
        
        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .priority-badge.high {
          background: var(--error-color);
          color: white;
        }
        
        .priority-badge.medium {
          background: var(--warning-color);
          color: white;
        }
        
        .priority-badge.low {
          background: var(--success-color);
          color: white;
        }
        
        .action-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        
        .error-message {
          text-align: center;
          padding: 2rem;
          color: var(--error-color);
        }
        
        .error-alert {
          background: var(--error-color);
          color: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `})]}):e.jsx("div",{className:"github-integration",children:e.jsxs("div",{className:"error-message",children:[e.jsx(x,{size:24}),e.jsx("h3",{children:"GitHub Integration Not Configured"}),e.jsx("p",{children:"Please add your GitHub personal access token to enable repository insights."})]})})};export{P as default};
//# sourceMappingURL=GitHubIntegration-D_-vFz0w.js.map
