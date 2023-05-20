import { createApp } from 'vue'
import Register from './Register.vue'

var app;
function CreateApp(C, props) {
	if(app != null) {
		app.unmount();
	}
	app = createApp(C, props);
	return app;
}

app = CreateApp(Register, {title:"公开系统"});
app.mount('#app');