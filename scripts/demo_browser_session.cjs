/* An authenticated fixture for local visual/functional checks, never production. */
module.exports=async function demoBrowserSession(target,base){
 const origin=new URL(base);
 if(!['127.0.0.1','localhost'].includes(origin.hostname))throw Error('Demo fixtures are local-only');
 await target.route(new URL('/api/demo-access.php',origin).href,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({authenticated:true,expiresAt:Date.now()+3600000,csrf:'local-functional-fixture'})}));
};
