import { createApp } from 'vue'
import Register from './register/Register.vue'
import Identity from './identity/Identity.vue'

import local_sign from 'local-sign';

var url = "http://" + location.hostname + ":7545/v1/jsonrpc";
var client = local_sign.new(url);

var app;
var identity = {
    account: null,
    contract:null,
    local_sign: local_sign,
    client:client,
    send: function(tx, callback){
        var account = tx.account;
        client.get_transaction_count(account, function(data){
            tx.sequence = data.result + "";
            tx.gas = "1000000";
            var blob = local_sign.sign(tx);
            console.log("blob", blob);
            client.send_raw_transaction(blob, function(data){
                console.log(data && data.result);
                callback && callback(data);
            });
        });
    },
    sendWith: function(root, tx, callback) {
        var lastRoot = client.root;
        client.root = root;

        var account = tx.account;
        client.get_transaction_count(account, function(data){
            tx.sequence = data.result + "";
            tx.gas = "1000000";
            var blob = local_sign.sign(tx);
            console.log("blob", blob);
            client.send_raw_transaction(blob, function(data){
                client.root = lastRoot;
                
                console.log(data && data.result);
                callback && callback(data);
            });
        });
    }
};
function CreateApp(C, props) {
	if(app != null) {
		app.unmount();
	}
	app = createApp(C, props);
	return app;
}

if(identity.account != null){
    app = CreateApp(Register, {title:"公开系统"});
    app.provide("identity", identity);
    app.mount('#app');
}else{
    app = CreateApp(Identity);
    app.provide("identity", identity);
    app.provide("on_back", function(system){
        console.log("back", system);
    });
    app.provide("on_next", function(system){
        console.log("next", system);

        app = CreateApp(Register, {title:"公开系统"});
        app.provide("identity", identity);
        app.mount('#app');
    });
    app.mount('#app');
}
