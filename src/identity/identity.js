import { createApp } from 'vue'
import Identity from './Identity.vue'

var app;
function CreateApp(C, props) {
	if(app != null) {
		app.unmount();
	}
	app = createApp(C, props);
	return app;
}

app = CreateApp(Identity, {system:"eth.0xc287B1266732495Fe8c93CE3Ba631597153fdd91"});
app.provide("on_back", function(system){
	console.log("back", system);
});
app.provide("on_next", function(system){
	console.log("next", system);
});
app.mount('#app');