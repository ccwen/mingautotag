console.log(require('yase').build({
	dbid:'mingshilu',
	blockshift:10,
	schema:function() {
		this.toctag(["s","p","qe"]);
	},  
	input:'mingshilu_test.xml',
	output:'mingshilu.ydb',
	outputencoding:'ucs2',
	author:'yapcheahshen@gmail.com',
	version:'0.0.1',
	estimatesize:1024*1024*200 // now is 150MB 
}));
