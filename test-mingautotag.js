var vows = require('vows'), 
    assert = require('assert'),
    Yase=require('yase');
vows.describe('yadm 4 test suite').addBatch({
    'texts': {
        topic: function () {
        		return new Yase.use('./mingshilu.ydb');
	},
	gettext:function(topic) {
		var r=topic.getText(203);
		console.log(r)
		//assert.equal('\n採用版本：同文書局原版。',r,'gettext');
	},
	dump:function(topic) {
		var r=topic.phraseSearch('定遠',{raw:true});
		console.log('q',r)
		return
		for (var i=265720;i<265730;i++) {
			console.log(i,topic.getText(i));
		}
	}
    },


}).export(module); // Export the Suite