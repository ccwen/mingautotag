var Yase=require('yase');
var db=new Yase.use('./mingshilu.ydb',{nowatch:true});

for (var i=1;i<100;i++) 
console.log( i,db.getText(i));
