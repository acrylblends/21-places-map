/** The Places Map look: the mockup's warm map workspace, plus forms and notices. */
export const STYLES = `
*{box-sizing:border-box}a{color:inherit;text-decoration:none}button,input,select,textarea{font:inherit}button{cursor:pointer}:focus-visible{outline:2px solid #276b4d;outline-offset:2px}
:root{--bg:#f4f6f2;--panel:#fff;--ink:#17251f;--muted:#77847c;--line:#e3e9e1;--green:#276b4d;--shadow:0 12px 35px #203b2b12}
body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui,sans-serif}
.app{height:100vh;min-height:650px;display:grid;grid-template-rows:64px 1fr}
.top{display:flex;align-items:center;gap:22px;padding:0 24px;background:#fff;border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:11px;font-weight:750;font-size:17px;letter-spacing:-.4px;white-space:nowrap}
.brandmark{width:28px;height:28px;background:var(--green);border-radius:9px;display:grid;place-items:center;color:#fff;font-size:15px}
.crumb{color:#9aa49d}.search{margin-left:auto;max-width:340px;flex:1;position:relative}
.search input{width:100%;border:1px solid var(--line);border-radius:10px;background:#f7f9f6;padding:10px 13px 10px 36px;outline:none;font-size:13px}
.search:before{content:'⌕';position:absolute;left:13px;top:5px;font-size:22px;color:#718077}
.topbtn,.primary{border:0;border-radius:9px;padding:10px 14px;font-weight:650;font-size:13px}
.topbtn{background:#f1f5f1;color:#43544a}.primary{background:var(--green);color:#fff}
.workspace{height:calc(100vh - 64px);min-height:0;display:grid;grid-template-columns:300px minmax(350px,1fr) 310px;gap:0}
.side{background:#fff;min-height:0;overflow:auto}.left{border-right:1px solid var(--line);padding:20px 17px}.right{border-left:1px solid var(--line);padding:21px}
.heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.heading h2{font-size:15px;margin:0}.tiny{font-size:11px;color:var(--muted)}
.filterrow{display:flex;gap:7px;flex-wrap:wrap;margin:13px 0 18px}
.chip{border:1px solid var(--line);background:#fff;padding:6px 9px;border-radius:30px;font-size:11px;color:#5c6a61}
.chip.active{background:#e4f1e8;border-color:#b8d7c2;color:#246346}
.place{width:100%;border:0;background:transparent;padding:12px 8px;text-align:left;display:flex;gap:11px;border-radius:10px;border-bottom:1px solid #f0f3ef;color:inherit}
.place:hover,.place.selected{background:#f0f6f1}
.place .dot{width:10px;height:10px;border-radius:50%;margin-top:5px;flex:none}
.place strong{display:block;font-size:12px}.place small{display:block;color:var(--muted);font-size:11px;margin-top:3px}
.mapwrap{position:relative;overflow:hidden;background:#e9eee8;min-height:0}
.map{position:absolute;inset:0;background-color:#e8eee6;background-image:linear-gradient(90deg,#dfe7dd 1px,transparent 1px),linear-gradient(#dfe7dd 1px,transparent 1px);background-size:70px 70px}
.map svg{width:100%;height:100%;position:absolute;inset:0}.map-label{font-size:11px;fill:#78877c;letter-spacing:1px}.pin{cursor:pointer;filter:drop-shadow(0 3px 4px #23402d35)}.pin circle{stroke:white;stroke-width:3}
.maptools{position:absolute;right:18px;top:18px;display:grid;gap:7px}.maptools button{width:37px;height:37px;border:1px solid #dce5dc;background:#fff;border-radius:10px;font-size:18px;box-shadow:var(--shadow)}
.maplegend{position:absolute;left:18px;bottom:18px;background:#fffffff0;border:1px solid #dce5dc;border-radius:12px;padding:10px 13px;display:flex;gap:14px;font-size:10px;color:#59685e}.maplegend i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px}
.detailtop{display:flex;align-items:center;justify-content:space-between}.detailname{font-size:19px;line-height:1.15;letter-spacing:-.5px;margin:14px 0 6px}
.tag{display:inline-block;padding:5px 8px;border-radius:6px;background:#e6f2e9;color:#286649;font-size:10px;font-weight:650}
.detailp{color:#65746a;font-size:12px;line-height:1.6}.coord{display:flex;justify-content:space-between;border-top:1px solid var(--line);padding:11px 0;font-size:11px}.coord span{color:var(--muted)}
.preview{height:105px;border-radius:10px;background:linear-gradient(135deg,#e2ece0,#d4e6df);margin:16px 0;position:relative;overflow:hidden}
.preview:before,.preview:after{content:'';position:absolute;background:#f8fbf5;border:1px solid #d4dfd3;transform:rotate(-20deg)}.preview:before{width:130%;height:23px;left:-10%;top:39px}.preview:after{width:25px;height:150%;left:65%;top:-20%}
.toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);padding:9px 13px;background:#17251f;color:#fff;border-radius:8px;font-size:11px;opacity:0;transition:.2s;pointer-events:none;z-index:30}.toast.show{opacity:1}
.empty{color:var(--muted);font-size:12px;padding:18px 5px}
.notice{margin:0 0 14px;padding:9px 12px;border-radius:8px;font-size:11px}.notice.ok{background:#e4f1e8;color:#246346}.notice.error{background:#f6e2dc;color:#8a3b24}
.form{background:#fff;border:1px solid var(--line);border-radius:12px;padding:20px;max-width:620px;margin:24px auto}
.form h2{font:650 18px Inter,system-ui;margin:0 0 6px}.form p{color:var(--muted);font-size:12px;margin:0 0 14px}
.field{display:block;margin-bottom:12px}.field span{display:block;font-size:10px;color:var(--muted);letter-spacing:.08em;margin-bottom:5px;text-transform:uppercase}
.field input,.field select,.field textarea{width:100%;border:1px solid var(--line);border-radius:8px;padding:9px;background:#fbfdfb;color:var(--ink);font-size:13px}
.field textarea{min-height:90px;resize:vertical}.formgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.actions{display:flex;gap:8px;align-items:center;margin-top:10px}.actions .primary{padding:9px 12px}.actions a{font-size:12px;color:var(--muted)}
.pagehead{display:flex;align-items:end;justify-content:space-between;gap:16px;padding:26px 28px 0}.pagehead small{font:10px ui-monospace;letter-spacing:.12em;color:var(--muted)}.pagehead h1{font:650 24px Inter,system-ui;margin:6px 0 3px}.pagehead p{color:var(--muted);font-size:12px;margin:0}
@media(max-width:1000px){.workspace{grid-template-columns:255px 1fr}.right{display:none}}
@media(max-width:650px){.app{height:auto;min-height:100vh;grid-template-rows:58px 1fr}.top{padding:0 12px}.crumb{display:none}.workspace{display:flex;flex-direction:column}.left{order:2;border:0;border-top:1px solid var(--line);max-height:320px}.mapwrap{height:65vh;min-height:430px;order:1}}
`
