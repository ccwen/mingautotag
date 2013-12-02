/* customizable parameters */
var tagname='pl'; // pl for place
var DB='mingshilu';
var placeid=require('./placeid');

//////////////////////////////////////////////
var Yase=require('yase').api;
var fs=require('fs')

//var hasmatch=[];
var hitcount=0;
var hits=[];
var db=null;
var outfile=[];
var services={};
Yase(services);
var yase=services['yase'];

var search=function() {
	var count=0;
	console.time('searching');
	for (var i in placeid) {
		count++;
		//if (count>1) break;
		if (count%256==0) outback(count+i+placeid[i]);
		//debugger;
		var r=yase.phraseSearch( { db:DB, tofind:i ,raw:true });
		//var R=yase.search({db:DB,query:i,output:['hits']});
		//var r=R.hits;

		if (r && r.length) {
			hitcount+=r.length;
			// voff, length of place, placeid
			for (var j in r) 	hits.push( [r[j], i.length, placeid[i] ] );
		}

	}

	console.log('hitcount',hitcount);
	console.timeEnd('searching');
	console.time('sorting');
	hits.sort(function(a,b){return a[0]-b[0]});
	console.timeEnd('sorting');
}

/* adding tag */
var rendertag=function(text,hit) {

	if (!(hit && hit.length)) return text;
	var res=yase.customfunc({db:DB,name:'tokenize',params:[text]});
	
	var i=0,j=0,last=0,voff=0;
	var output='';
	while (i<res.length) {
		while (j<hit.length && voff==hit[j][0]) {
			output+= '<'+tagname+' len="'+hit[j][1]+'" id="'+hit[j][2] +'"/>';
			j++;
		} 
		output+=res[i];
		if (res[i][0]!='<') voff++;
		i++;
	}
	if (j!=hit.length) {
		console.log('unconsumed hits!',hit.length,j,hit);
		console.log('IN',text)
		console.log('OUT',output)
	}
	return output;
}
var outback = function (s) {
    while (s.length < 70) s += ' ';
    var l = s.length; 
    for (var i = 0; i < l; i++) s += String.fromCharCode(8);
    process.stdout.write(s);
}
var autotag=function() {
	var nslot=0,t='',hit=[];
	var lastslot=-1,addition=0;
	var meta=yase.getRaw([DB,'meta'],true);
	var slotsize = 2 << (meta.slotshift -1);
	
	var onepercent=Math.floor(meta.slotcount / 100);
	var start=0,i=0;
	outfile=[];
	while (i<hits.length) {
		if (i%onepercent==0) outback( 'tagging progress:'+Math.round(100*(i/hits.length)).toString()+'%');
		nslot=Math.floor(hits[i][0]  / slotsize);
		if (nslot>lastslot) {
			var newtext=yase.getText({db:DB,slot:nslot});
			if (newtext) {
				if (t) {
					var renderred=rendertag(t,hit);
					outfile.push(renderred); //debug add lastslot				
				}
				hit=[]; 
				addition=0;
				start=lastslot+1;
			} else {
				start=lastslot;
				addition+=meta.slotsize;
			}

			for (var j=start;j<nslot;j++) {
				t=yase.getText({db:DB,slot:j});
				if (t) outfile.push(t); 
			}				
			t=newtext;
		}

		if (i==hits.length) break;
		hit.push( [ addition+hits[i][0] % meta.slotsize, hits[i][1] , hits[i][2]] );
		i++;
		lastslot=nslot;
	}
	if (t) {
		outfile.push(rendertag(t,hit)); //debug add lastslot	
	}

	for (var j=lastslot+1;j<meta.slotcount;j++) {
		outfile.push(yase.getText({db:DB,slot:j})); 
	}
}


var writetofile=function() {
	//console.log('hitcount',hitcount,'matchcount',hasmatch.length)
//	fs.writeFileSync(  'hasmatch.txt',JSON.stringify(hasmatch) ,'ucs2');
	//fs.writeFileSync(  'hits.txt',JSON.stringify(output) ,'utf8');
	console.log('start writing, lines:',outfile.length);
	fs.writeFileSync('output.txt',outfile.join(''),'utf8');
}

var doit=function() {
	search();
	console.time('autotag')
	autotag();
	console.timeEnd('autotag')
	console.time('writefile')
	writetofile();
	console.timeEnd('writefile')

}
if (typeof QUnit!=='undefined') {
	QUnit.test("debugging autotag",function() {
		doit();
		equal(1,1)
	});
} else doit();
