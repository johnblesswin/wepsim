var sim={systems:[],active:null,index:0};function simhw_add(newElto){var found=-1;for(var m=0;m<sim.systems.length;m++){if(sim.systems[m].sim_short_name==newElto.sim_short_name){sim.systems[m]=newElto;sim.index=m;found=m}}if(-1==found){sim.systems.push(newElto);sim.index=sim.systems.length-1}sim.active=newElto;sim[newElto.sim_short_name]=newElto;check_behavior();compile_behaviors();firedep_to_fireorder(jit_fire_dep);compute_references();compile_verbals()}function simhw_getActive(){return sim.index}function simhw_setActive(newActive){if(newActive>=0&&sim.systems.length>=newActive){sim.active=sim.systems[newActive];sim.index=newActive}compile_behaviors();firedep_to_fireorder(jit_fire_dep);compute_references();compile_verbals()}function simhw_getIdByName(short_name){for(var m=0;m<sim.systems.length;m++){if(sim.systems[m].sim_short_name==short_name){return m}}return-1}function simhw_getObjByName(short_name){for(var m=0;m<sim.systems.length;m++){if(sim.systems[m].sim_short_name==short_name){return sim.systems[m]}}return null}function simhw_active(){return sim.active}function simhw_short_name(){return sim.active.sim_short_name}function simhw_sim_signals(){return sim.active.signals}function simhw_sim_signal(id){return sim.active.signals[id]}function simhw_sim_states(){return sim.active.states}function simhw_sim_state(id){return sim.active.states[id]}function simhw_syntax_behaviors(){return sim.active.behaviors}function simhw_syntax_behavior(id){return sim.active.behaviors[id]}function simhw_sim_components(){return sim.active.components}function simhw_sim_component(id){return sim.active.components[id]}function simhw_internalState(name){return sim.active.internal_states[name]}function simhw_internalState_get(name,id){return sim.active.internal_states[name][id]}function simhw_internalState_set(name,id,val){sim.active.internal_states[name][id]=val}function simhw_internalState_reset(name,val){sim.active.internal_states[name]=val}function simhw_sim_ctrlStates_get(){return sim.active.ctrl_states}var ws_hw_hash={};var ws_hw_set=[];function simhw_hwset_init(){var url_list=get_cfg("hw_url");ws_hw_set=wepsim_url_getJSON(url_list);for(var i=0;i<ws_hw_set.length;i++){ws_hw_hash[ws_hw_set[i].name]=ws_hw_set[i].url}return ws_hw_hash}function simhw_hwset_getSet(){return ws_hw_hash}function simhw_hwset_loadAll(){var jobj={};for(var i=0;i<ws_hw_set.length;i++){jobj=$.getJSON({url:ws_hw_set[i].url,async:false});simcore_hardware_import(jobj.responseText)}return true}function simhw_hwset_load(p_name){if(typeof ws_hw_hash[p_name]==="undefined"){return false}var jobj=$.getJSON({url:ws_hw_hash[p_name],async:false});simcore_hardware_import(jobj.responseText);return true}function get_value(sim_obj){if(typeof sim_obj.value=="function"){return sim_obj.value()}return sim_obj.value}function set_value(sim_obj,value){if(typeof sim_obj.value=="function"){if(sim_obj.value()!=value)sim_obj.changed=true;sim_obj.value(value)}else{if(sim_obj.value!=value)sim_obj.changed=true;sim_obj.value=value}}function reset_value(sim_obj){if(typeof sim_obj.value=="function"){if(sim_obj.value()!=sim_obj.default_value)sim_obj.changed=true;set_value(sim_obj,sim_obj.default_value)}else if(typeof sim_obj.default_value=="object"){sim_obj.changed=true;sim_obj.value=Object.create(sim_obj.default_value)}else if(sim_obj instanceof Array){sim_obj.changed=true;for(var i=0;i<sim_obj.length;i++)set_value(sim_obj[i],sim_obj[i].default_value)}else{if(sim_obj.value!=sim_obj.default_value)sim_obj.changed=true;set_value(sim_obj,sim_obj.default_value)}}function get_var(sim_var){if(typeof sim_var=="function"){return sim_var()}else{return sim_var}}function set_var(sim_var,value){if(typeof sim_var=="function"){sim_var(value)}else{sim_var=value}}var sim_references={};function compute_references(){for(var key in simhw_sim_signals()){sim_references[key]=simhw_sim_signal(key);simhw_sim_signal(key).changed=false}for(key in simhw_sim_states()){sim_references[key]=simhw_sim_state(key);simhw_sim_state(key).changed=false}}function get_reference(sim_name){return sim_references[sim_name]}function show_verbal(key){var vn=simhw_sim_state(key);if(typeof vn=="undefined")vn=simhw_sim_signal(key);if("undefined"==typeof vn)return key;if("undefined"==typeof vn.verbal)return key;return vn.verbal}function show_value(value){if(isNaN(value)){return"NaN"}return"0x"+(value>>>0).toString(16)}function check_behavior(){if(0==simhw_sim_signals().length){ws_alert("ALERT: empty signals!!!")}if(0==simhw_sim_states().length){ws_alert("ALERT: empty states!!!")}for(var key in simhw_sim_signals()){for(var key2 in simhw_sim_signal(key).behavior){var behaviors=simhw_sim_signal(key).behavior[key2].split(";");for(var i=0;i<behaviors.length;i++){var behavior_i=behaviors[i].trim();var behavior_k=behavior_i.split(" ");if(""==behavior_i){continue}if(typeof simhw_syntax_behavior(behavior_k[0])=="undefined"){ws_alert("ALERT: Unknown operation -> "+behavior_k[0]+" ("+behavior_i+")");return}if(behavior_k.length!=simhw_syntax_behavior(behavior_k[0]).nparameters){ws_alert("ALERT: Behavior has an incorrect number of elements --\x3e "+behavior_i+"/"+simhw_syntax_behavior(behavior_k[0]).nparameters);return}for(var j=1;j<behavior_k.length;j++){var s=behavior_k[j].split("/");var t=simhw_syntax_behavior(behavior_k[0]).types[j-1];if("E"==t&&typeof simhw_sim_state(s[0])=="undefined"){ws_alert("ALERT: Behavior has an undefined reference to a object state -> '"+behavior_i);return}else if("S"==t&&typeof simhw_sim_signal(s[0])=="undefined"){ws_alert("ALERT: Behavior has an undefined reference to a signal -> '"+behavior_i);return}else if("X"==t&&typeof simhw_sim_state(s[0])=="undefined"&&typeof simhw_sim_signal(s[0])=="undefined"){ws_alert("ALERT: Behavior has an undefined reference to a object state OR signal -> '"+behavior_i);return}}}}}}var jit_behaviors=false;var jit_verbals=false;var jit_fire_dep=null;var jit_fire_order=null;var jit_dep_network=null;var jit_fire_ndep=null;function firedep_to_fireorder(jit_fire_dep){var allfireto=false;jit_fire_order=[];jit_fire_ndep=[];for(var sig in simhw_sim_signals()){if(typeof jit_fire_dep[sig]=="undefined"){jit_fire_order.push(sig);continue}ndep=0;allfireto=false;for(var sigorg in jit_fire_dep[sig]){ndep++;if(jit_fire_dep[sig][sigorg]==simhw_sim_signal(sigorg).behavior.length){allfireto=true}}jit_fire_ndep[sig]=ndep;if(allfireto==false)jit_fire_order.push(sig)}}function compile_behaviors(){var jit_bes="";jit_fire_dep={};var sig_obj=null;var expr_obj=null;for(var sig in simhw_sim_signals()){jit_bes+="simhw_sim_signal('"+sig+"').behavior_fn = new Array();\n";for(var val in simhw_sim_signal(sig).behavior){var input_behavior=simhw_sim_signal(sig).behavior[val];var jit_be="";var s_exprs=input_behavior.split(";");for(var i=0;i<s_exprs.length;i++){s_exprs[i]=s_exprs[i].trim();if(""==s_exprs[i])continue;var s_expr=s_exprs[i].split(" ");if(s_expr[0]!="NOP")jit_be+="simhw_syntax_behavior('"+s_expr[0]+"').operation("+JSON.stringify(s_expr)+");\t";if("FIRE"==s_expr[0]){sig_obj=simhw_sim_signal(sig);expr_obj=simhw_sim_signal(s_expr[1]);if(typeof expr_obj=="undefined"){ws_alert("ERROR: for signal '"+sig+"', unknow behavior '"+s_exprs[i]+"'")}else if(sig_obj.type==expr_obj.type){if(typeof jit_fire_dep[s_expr[1]]=="undefined")jit_fire_dep[s_expr[1]]={};if(typeof jit_fire_dep[s_expr[1]][sig]=="undefined")jit_fire_dep[s_expr[1]][sig]=0;jit_fire_dep[s_expr[1]][sig]++}}}jit_bes+="simhw_sim_signal('"+sig+"').behavior_fn["+val+"] = \t function() {"+jit_be+"};\n"}}eval(jit_bes);jit_behaviors=true}function compute_behavior(input_behavior){var s_exprs=input_behavior.split(";");for(var i=0;i<s_exprs.length;i++){s_exprs[i]=s_exprs[i].trim();if(""==s_exprs[i])continue;var s_expr=s_exprs[i].split(" ");simhw_syntax_behavior(s_expr[0]).operation(s_expr)}}function compute_general_behavior(name){if(jit_behaviors)simhw_syntax_behavior(name).operation();else compute_behavior(name)}function compute_signal_behavior(signal_name,signal_value){if(jit_behaviors)simhw_sim_signal(signal_name).behavior_fn[signal_value]();else compute_behavior(simhw_sim_signal(signal_name).behavior[signal_value])}function compile_verbals(){var jit_vbl="";for(var sig in simhw_sim_signals()){jit_vbl+="simhw_sim_signal('"+sig+"').verbal_fn = new Array();\n";for(var val in simhw_sim_signal(sig).behavior){var input_behavior=simhw_sim_signal(sig).behavior[val];var jit_be=' var r = ""; ';var s_exprs=input_behavior.split(";");for(var i=0;i<s_exprs.length;i++){s_exprs[i]=s_exprs[i].trim();if(""==s_exprs[i])continue;var s_expr=s_exprs[i].split(" ");jit_be+=" r = r + simhw_syntax_behavior('"+s_expr[0]+"').verbal("+JSON.stringify(s_expr)+");\t"}jit_vbl+="simhw_sim_signal('"+sig+"').verbal_fn["+val+"] = \t function() {"+jit_be+" return r; };\n"}}eval(jit_vbl);jit_verbals=true}function compute_verbal(input_behavior){var verbal="";var s_exprs=input_behavior.split(";");for(var i=0;i<s_exprs.length;i++){s_exprs[i]=s_exprs[i].trim();if(""==s_exprs[i])continue;var s_expr=s_exprs[i].split(" ");verbal=verbal+simhw_syntax_behavior(s_expr[0]).verbal(s_expr)}return verbal}function compute_signal_verbals(signal_name,signal_value){var verbal="";var sig_ref=null;sig_ref=simhw_sim_signal(signal_name);if(typeof sig_ref.behavior=="undefined"){return verbal}var index=sig_ref.behavior.length-1;if(signal_value<index){index=signal_value}if(typeof sig_ref.verbal!="undefined"&&typeof sig_ref.verbal[index]!="undefined"){return sig_ref.verbal[index]}if(jit_behaviors)verbal=sig_ref.verbal_fn[index]();else verbal=compute_verbal(sig_ref.behavior[index]);return verbal}var ep_def={sim_name:"Elemental Processor",sim_short_name:"ep",sim_img_processor:"examples/hardware/ep/images/processor.svg",sim_img_controlunit:"examples/hardware/ep/images/controlunit.svg",sim_img_cpu:"examples/hardware/ep/images/cpu.svg",components:{},states:{},signals:{},behaviors:{},events:{},internal_states:{},ctrl_states:{}};simhw_add(ep_def);sim.ep.behaviors.PRINT_S={nparameters:2,types:["S"],operation:function(s_expr){console.log(s_expr[1]+": 0x"+sim.ep.signals[s_expr[1]].value.toString(16))},verbal:function(s_expr){return"Print value of signal "+s_expr[1]+": 0x"+sim.ep.signals[s_expr[1]].value.toString(16)+". "}};sim.ep.behaviors.PRINT_E={nparameters:2,types:["E"],operation:function(s_expr){console.log(s_expr[1]+": 0x"+sim.ep.states[s_expr[1]].value.toString(16))},verbal:function(s_expr){return"Print value of state "+s_expr[1]+": 0x"+sim.ep.states[s_expr[1]].value.toString(16)+". "}};sim.ep.components["CPU"]={name:"CPU",version:"1",abilities:["CPU"],details_name:["REGISTER_FILE","CONTROL_MEMORY","CLOCK","CPU_STATS"],details_fire:[["svg_p:text3029","svg_p:text3031"],["svg_cu:text3010"],["svg_p:text3459-7","svg_cu:text4138","svg_cu:text4138-7"],["svg_p:text3495"]],write_state:function(vec){if(typeof vec.CPU=="undefined")vec.CPU={};var internal_reg=["PC","SR"];var value=0;for(var i=0;i<sim.ep.states.BR.length;i++){value=parseInt(sim.ep.states.BR[i].value);if(value!=0){vec.CPU["R"+i]={type:"register",default_value:0,id:"R"+i,op:"=",value:"0x"+value.toString(16)}}}for(i=0;i<internal_reg.length;i++){value=parseInt(sim.ep.states["REG_"+internal_reg[i]].value);if(value!=0){vec.CPU[internal_reg[i]]={type:"register",default_value:0,id:internal_reg[i],op:"=",value:"0x"+value.toString(16)}}}return vec},read_state:function(vec,check){if(typeof vec.CPU=="undefined")vec.CPU={};var key=check["id"].toUpperCase().trim();var val=parseInt(check["value"]).toString(16);if("REGISTER"==check["type"].toUpperCase().trim()){vec.CPU[key]={type:"register",default_value:0,id:key,op:check["condition"],value:"0x"+val};return true}return false},get_state:function(reg){var r_reg=reg.toUpperCase().trim();if(typeof sim.ep.states["REG_"+r_reg]!="undefined"){return"0x"+get_value(sim.ep.states["REG_"+r_reg]).toString(16)}r_reg=r_reg.replace("R","");var index=parseInt(r_reg);if(typeof sim.ep.states.BR[index]!="undefined"){return"0x"+get_value(sim.ep.states.BR[index]).toString(16)}return null},get_value:function(elto){if(Number.isInteger(elto))index=elto;else index=parseInt(elto);if(isNaN(index))return get_value(simhw_sim_state(elto))>>>0;return get_value(simhw_sim_states().BR[index])>>>0},set_value:function(elto,value){var pc_name=simhw_sim_ctrlStates_get().pc.state;if(Number.isInteger(elto))index=elto;else index=parseInt(elto);if(isNaN(index)){set_value(simhw_sim_state(elto),value);if(pc_name===elto){show_asmdbg_pc()}return value}return set_value(simhw_sim_states().BR[index],value)}};sim.ep.ctrl_states.pc={name:"PC",state:"REG_PC"};sim.ep.ctrl_states.sp={name:"SP",state:"BR.29"};sim.ep.ctrl_states.ir={name:"IR",state:"REG_IR",default_eltos:{co:{begin:0,end:5,length:6},cop:{begin:28,end:31,length:4}}};sim.ep.ctrl_states.mpc={name:"mPC",state:"REG_MICROADDR"};sim.ep.internal_states.MC={};sim.ep.internal_states.MC_dashboard={};sim.ep.internal_states.ROM={};sim.ep.internal_states.FIRMWARE={};sim.ep.internal_states.io_hash={};sim.ep.internal_states.fire_stack=[];sim.ep.internal_states.tri_state_names=["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11"];sim.ep.internal_states.fire_visible={databus:false,internalbus:false};sim.ep.internal_states.filter_states=["REG_IR_DECO,col-11","REG_IR,col-auto","REG_PC,col-auto","REG_MAR,col-auto","REG_MBR,col-auto","REG_RT1,col-auto","REG_RT2,col-auto","REG_RT3,col-auto","REG_SR,col-auto","REG_MICROADDR,col-auto"];sim.ep.internal_states.filter_signals=["A0,0","B,0","C,0","SELA,5","SELB,5","SELC,2","SELCOP,0","MR,0","MC,0","C0,0","C1,0","C2,0","C3,0","C4,0","C5,0","C6,0","C7,0","T1,0","T2,0","T3,0","T4,0","T5,0","T6,0","T7,0","T8,0","T9,0","T10,0","T11,0","M1,0","M2,0","M7,0","MA,0","MB,0","SELP,0","LC,0","SE,0","SIZE,0","OFFSET,0","BW,0","R,0","W,0","TA,0","TD,0","IOR,0","IOW,0","TEST_I,0","TEST_U,0"];sim.ep.internal_states.alu_flags={flag_n:0,flag_z:0,flag_v:0,flag_c:0};sim.ep.states.BR=[];sim.ep.states.BR[0]={name:"R0",verbal:"Register 0",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[1]={name:"R1",verbal:"Register 1",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[2]={name:"R2",verbal:"Register 2",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[3]={name:"R3",verbal:"Register 3",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[4]={name:"R4",verbal:"Register 4",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[5]={name:"R5",verbal:"Register 5",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[6]={name:"R6",verbal:"Register 6",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[7]={name:"R7",verbal:"Register 7",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[8]={name:"R8",verbal:"Register 8",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[9]={name:"R9",verbal:"Register 9",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[10]={name:"R10",verbal:"Register 10",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[11]={name:"R11",verbal:"Register 11",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[12]={name:"R12",verbal:"Register 12",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[13]={name:"R13",verbal:"Register 13",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[14]={name:"R14",verbal:"Register 14",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[15]={name:"R15",verbal:"Register 15",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[16]={name:"R16",verbal:"Register 16",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[17]={name:"R17",verbal:"Register 17",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[18]={name:"R18",verbal:"Register 18",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[19]={name:"R19",verbal:"Register 19",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[20]={name:"R20",verbal:"Register 20",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[21]={name:"R21",verbal:"Register 21",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[22]={name:"R22",verbal:"Register 22",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[23]={name:"R23",verbal:"Register 23",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[24]={name:"R24",verbal:"Register 24",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[25]={name:"R25",verbal:"Register 25",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[26]={name:"R26",verbal:"Register 26",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[27]={name:"R27",verbal:"Register 27",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[28]={name:"R28",verbal:"Register 28",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[29]={name:"R29",verbal:"Register 29",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[30]={name:"R30",verbal:"Register 30",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.BR[31]={name:"R31",verbal:"Register 31",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["REG_PC"]={name:"PC",verbal:"Program Counter Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["REG_MAR"]={name:"MAR",verbal:"Memory Address Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["REG_MBR"]={name:"MBR",verbal:"Memory Data Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["REG_IR"]={name:"IR",verbal:"Instruction Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["REG_RT1"]={name:"RT1",verbal:"Temporal 1 Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["REG_RT2"]={name:"RT2",verbal:"Temporal 2 Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["REG_RT3"]={name:"RT3",verbal:"Temporal 3 Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["REG_SR"]={name:"SR",verbal:"State Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["BUS_IB"]={name:"I_BUS",verbal:"Internal Bus",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["BUS_AB"]={name:"A_BUS",verbal:"Address Bus",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["BUS_CB"]={name:"C_BUS",verbal:"Control Bus",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["BUS_DB"]={name:"D_BUS",verbal:"Data Bus",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["C2_T2"]={name:"C2_T2",verbal:"Output of PC",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["RA_T9"]={name:"RA_T9",verbal:"Input of T9 Tristate",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["RB_T10"]={name:"RB_T10",verbal:"Input of T10 Tristate",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["SELEC_T3"]={name:"SELEC_T3",verbal:"Input of T3 Tristate",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["SELP_M7"]={name:"SELP_M7",verbal:"Output of MUX SelP",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["ALU_C6"]={name:"ALU_C6",verbal:"Input of Temporal 3 Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["MA_ALU"]={name:"MA_ALU",verbal:"Input ALU via MA",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["MB_ALU"]={name:"MB_ALU",verbal:"Input ALU via MB",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["FLAG_C"]={name:"FLAG_C",verbal:"Carry Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.ep.states["FLAG_V"]={name:"FLAG_V",verbal:"Overflow Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.ep.states["FLAG_N"]={name:"FLAG_N",verbal:"Negative Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.ep.states["FLAG_Z"]={name:"FLAG_Z",verbal:"Zero Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.ep.states["FLAG_I"]={name:"FLAG_I",verbal:"Interruption Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.ep.states["FLAG_U"]={name:"FLAG_U",verbal:"User Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.ep.states["REG_MICROADDR"]={name:"µADDR",verbal:"Microaddress Register",visible:true,nbits:"12",value:0,default_value:0,draw_data:["svg_cu:text4667"]};sim.ep.states["REG_MICROINS"]={name:"µINS",verbal:"Microinstruction Register",visible:true,nbits:"77",value:{},default_value:{},draw_data:[]};sim.ep.states["FETCH"]={name:"FETCH",verbal:"Input Fetch",visible:false,nbits:"12",value:0,default_value:0,draw_data:[]};sim.ep.states["ROM_MUXA"]={name:"ROM_MUXA",verbal:"Input ROM",visible:false,nbits:"12",value:0,default_value:0,draw_data:[]};sim.ep.states["SUM_ONE"]={name:"SUM_ONE",verbal:"Input next microinstruction",visible:false,nbits:"12",value:1,default_value:1,draw_data:[]};sim.ep.states["MUXA_MICROADDR"]={name:"MUXA_MICROADDR",verbal:"Input microaddress",visible:false,nbits:"12",value:0,default_value:0,draw_data:[]};sim.ep.states["MUXC_MUXB"]={name:"MUXC_MUXB",verbal:"Output of MUX C",visible:false,nbits:"1",value:0,default_value:0,draw_data:[]};sim.ep.states["INEX"]={name:"INEX",verbal:"Illegal Instruction Exception",visible:false,nbits:"1",value:0,default_value:0,draw_data:[]};sim.ep.states["BS_M1"]={name:"BS_M1",verbal:"from Memory",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["BS_TD"]={name:"BS_TD",verbal:"Memory",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["INTV"]={name:"INTV",verbal:"Interruption Vector",visible:false,nbits:"8",value:0,default_value:0,draw_data:[]};sim.ep.states["M2_C2"]={name:"M2_C2",verbal:"Input of Program Counter",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["M1_C1"]={name:"M1_C1",verbal:"Input of Memory Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["M7_C7"]={name:"M7_C7",verbal:"Input of State Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["VAL_ZERO"]={name:"VAL_ZERO",verbal:"Wired Zero",visible:false,nbits:"1",value:0,default_value:0,draw_data:[]};sim.ep.states["VAL_ONE"]={name:"VAL_ONE",verbal:"Wired One",visible:false,nbits:"32",value:1,default_value:1,draw_data:[]};sim.ep.states["VAL_FOUR"]={name:"VAL_FOUR",verbal:"Wired Four",visible:false,nbits:"32",value:4,default_value:4,draw_data:[]};sim.ep.states["REG_IR_DECO"]={name:"IR_DECO",verbal:"Instruction Decoded",visible:true,nbits:"0",value:0,default_value:0,draw_data:[]};sim.ep.states["DECO_INS"]={name:"DECO_INS",verbal:"Instruction decoded in binary",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states["CLK"]={name:"CLK",verbal:"Clock",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.signals["C"]={name:"C",visible:true,type:"L",value:0,default_value:0,nbits:"4",behavior:["MV MUXC_MUXB VAL_ZERO; FIRE B","MBIT MUXC_MUXB INT 0 1; FIRE B","MBIT MUXC_MUXB IORDY 0 1; FIRE B","MBIT MUXC_MUXB MRDY 0 1; FIRE B","MBIT MUXC_MUXB REG_SR 0 1; FIRE B","MBIT MUXC_MUXB REG_SR 1 1; FIRE B","MBIT MUXC_MUXB REG_SR 28 1; FIRE B","MBIT MUXC_MUXB REG_SR 29 1; FIRE B","MBIT MUXC_MUXB REG_SR 30 1; FIRE B","MBIT MUXC_MUXB REG_SR 31 1; FIRE B","MV MUXC_MUXB INEX; FIRE B"],fire_name:["svg_cu:text3410"],draw_data:[["svg_cu:path3108"],["svg_cu:path3062"],["svg_cu:path3060"],["svg_cu:path3136"],["svg_cu:path3482"],["svg_cu:path3480"],["svg_cu:path3488"],["svg_cu:path3486"],["svg_cu:path3484"],["svg_cu:path3484-9"],["svg_cu:path3108-3","svg_cu:path3260-3-8-6","svg_cu:path3260-3-8","svg_cu:path3260-3"]],draw_name:[["svg_cu:path3496","svg_cu:path3414","svg_cu:path3194-08"]]};sim.ep.signals["B"]={name:"B",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV A1 MUXC_MUXB; FIRE A1","NOT_ES A1 MUXC_MUXB; FIRE A1"],depends_on:["CLK"],fire_name:["svg_cu:text3408"],draw_data:[["svg_cu:path3094-7"],["svg_cu:path3392","svg_cu:path3372","svg_cu:path3390","svg_cu:path3384","svg_cu:path3108-1","svg_cu:path3100-8-7"]],draw_name:[[],["svg_cu:path3194-0","svg_cu:path3138-8","svg_cu:path3498-6"]]};sim.ep.signals["A0"]={name:"A0",visible:false,type:"L",value:0,default_value:0,nbits:"1",behavior:["SBIT_SIGNAL A0A1 0 1; FIRE A0A1","SBIT_SIGNAL A0A1 1 1; FIRE A0A1"],depends_on:["CLK"],fire_name:["svg_cu:text3406"],draw_data:[["svg_cu:path3096"],["svg_cu:path3096"]],draw_name:[[],["svg_cu:path3138-8-1","svg_cu:path3098-2","svg_cu:path3124-2-5"]]};sim.ep.signals["A1"]={name:"A1",visible:false,type:"L",value:0,default_value:0,nbits:"1",behavior:["SBIT_SIGNAL A0A1 0 0; FIRE A0A1","SBIT_SIGNAL A0A1 1 0; FIRE A0A1"],depends_on:["CLK"],fire_name:[],draw_data:[["svg_cu:path3094"],["svg_cu:path3094"]],draw_name:[[]]};sim.ep.signals["A0A1"]={name:"A0A1",visible:true,type:"L",value:0,default_value:0,nbits:"2",behavior:["PLUS1 MUXA_MICROADDR REG_MICROADDR","CP_FIELD MUXA_MICROADDR REG_MICROINS/MADDR","MV MUXA_MICROADDR ROM_MUXA","MV MUXA_MICROADDR FETCH"],depends_on:["CLK"],fire_name:[],draw_data:[["svg_cu:path3102","svg_cu:path3100","svg_cu:path3098","svg_cu:path3100-9","svg_cu:path3088"],["svg_cu:path3104","svg_cu:path3134","svg_cu:path3500","svg_cu:path3416"],["svg_cu:path3504","svg_cu:path3100-8","svg_cu:path3234-9"],["svg_cu:path3124"]],draw_name:[[]]};sim.ep.signals["C0"]={name:"C0",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","LOAD REG_MAR BUS_IB"],fire_name:["svg_p:text3077"],draw_data:[["svg_p:path3081"]],draw_name:[["svg_p:path3075"]]};sim.ep.signals["C1"]={name:"C1",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","LOAD REG_MBR M1_C1"],fire_name:["svg_p:text3079"],draw_data:[["svg_p:path3055"]],draw_name:[["svg_p:path3073"]]};sim.ep.signals["C2"]={name:"C2",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","LOAD REG_PC M2_C2; UPDATEDPC"],fire_name:["svg_p:text3179"],draw_data:[["svg_p:path3485"]],draw_name:[["svg_p:path3177"]]};sim.ep.signals["C3"]={name:"C3",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","LOAD REG_IR BUS_IB; DECO; FIRE_IFSET C 10"],fire_name:["svg_p:text3439"],draw_data:[["svg_p:path3339"]],draw_name:[["svg_p:path3337"]]};sim.ep.signals["C4"]={name:"C4",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","LOAD REG_RT1 BUS_IB"],fire_name:["svg_p:text3441"],draw_data:[["svg_p:path3263"]],draw_name:[["svg_p:path3255"]]};sim.ep.signals["C5"]={name:"C5",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","LOAD REG_RT2 BUS_IB"],fire_name:["svg_p:text3443"],draw_data:[["svg_p:path3277"]],draw_name:[["svg_p:path3269"]]};sim.ep.signals["C6"]={name:"C6",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","LOAD REG_RT3 ALU_C6"],fire_name:["svg_p:text3445"],draw_data:[["svg_p:path3325","svg_p:path3323"]],draw_name:[["svg_p:path3245"]]};sim.ep.signals["C7"]={name:"C7",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","LOAD REG_SR M7_C7; FIRE C"],fire_name:["svg_p:text3655"],draw_data:[["svg_p:path3651-9"]],draw_name:[["svg_p:path3681"]]};sim.ep.signals["TA"]={name:"TA",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_AB REG_MAR; MOVE_BITSE A1A0 0 2 BUS_AB 0; FIRE_IFCHANGED A1A0 A1A0"],fire_name:["svg_p:text3091"],draw_data:[["svg_p:path3089","svg_p:path3597","svg_p:path3513","svg_p:path3601","svg_p:path3601-2","svg_p:path3187","svg_p:path3087","svg_p:path2995","svg_p:path3535"]],draw_name:[["svg_p:path3085"]]};sim.ep.signals["TD"]={name:"TD",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_DB BS_TD; MOVE_BITSE A1A0 0 2 BUS_AB 0; FIRE_IFCHANGED A1A0 A1A0"],fire_name:["svg_p:text3103"],draw_data:[["svg_p:path3101","svg_p:path3587","svg_p:path3515","svg_p:path3071","svg_p:path3419","svg_p:path3099","svg_p:path3097","svg_p:path3559-5","svg_p:path3419-1-0","svg_p:path3583","svg_p:path3419-1","svg_p:path3491","svg_p:path3641","svg_p:path3541"]],draw_name:[["svg_p:path3095"]]};sim.ep.signals["T1"]={name:"T1",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB REG_MBR; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3105"],draw_data:[["svg_p:path3071","svg_p:path3069","svg_p:path3049","svg_p:path3063-9","svg_p:path3071","svg_p:path3071"]],draw_name:[["svg_p:path3067"]]};sim.ep.signals["T2"]={name:"T2",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB REG_PC; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3449"],draw_data:[["svg_p:path3199","svg_p:path3201","svg_p:path3049"]],draw_name:[["svg_p:path3329"]]};sim.ep.signals["T3"]={name:"T3",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB SELEC_T3; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3451"],draw_data:[["svg_p:path3349","svg_p:path3931","svg_p:path3345","svg_p:path3049"]],draw_name:[["svg_p:path3351"]]};sim.ep.signals["T4"]={name:"T4",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB REG_RT1; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3453"],draw_data:[["svg_p:path3261","svg_p:path3259","svg_p:path3049"]],draw_name:[["svg_p:path3305"]]};sim.ep.signals["T5"]={name:"T5",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB REG_RT2; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3455"],draw_data:[["svg_p:path3275","svg_p:path3273","svg_p:path3049"]],draw_name:[["svg_p:path3307"]]};sim.ep.signals["T6"]={name:"T6",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB ALU_C6; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3457"],draw_data:[["svg_p:path3589","svg_p:path3317","svg_p:path3163-2","svg_p:path3049"]],draw_name:[["svg_p:path3319"]]};sim.ep.signals["T7"]={name:"T7",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB REG_RT3; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3459"],draw_data:[["svg_p:path3327","svg_p:path3311","svg_p:path3049"]],draw_name:[["svg_p:path3313"]]};sim.ep.signals["T8"]={name:"T8",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB REG_SR; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3657"],draw_data:[["svg_p:path3651","svg_p:path3647","svg_p:path3049"]],draw_name:[["svg_p:path3649"]]};sim.ep.signals["T9"]={name:"T9",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB RA_T9; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3147"],draw_data:[["svg_p:path3143","svg_p:path3139","svg_p:path3049","svg_p:path3143-9"]],draw_name:[["svg_p:path3133"]]};sim.ep.signals["T10"]={name:"T10",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB RB_T10; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3149"],draw_data:[["svg_p:path3145","svg_p:path3141","svg_p:path3049","svg_p:path3145-5"]],draw_name:[["svg_p:path3137"]]};sim.ep.signals["T11"]={name:"T11",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","CP_FIELD BUS_IB REG_MICROINS/EXCODE; FIRE M7; FIRE M2; FIRE M1"],fire_name:["svg_p:text3147-5","svg_cu:tspan4426"],draw_data:[["svg_p:path3145","svg_p:path3081-3","svg_p:path3139-7","svg_p:path3049","svg_cu:path3081-3","svg_cu:path3139-7","svg_cu:path3502"]],draw_name:[["svg_p:path3133-6","svg_cu:path3133-6"]]};sim.ep.signals["M1"]={name:"M1",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV M1_C1 BUS_IB","MV M1_C1 BS_M1"],depends_on:["C1"],fire_name:["svg_p:text3469"],draw_data:[["svg_p:path3063","svg_p:path3061","svg_p:path3059"],["svg_p:path3057","svg_p:path3641","svg_p:path3419","svg_p:path3583"]],draw_name:[[],["svg_p:path3447"]]};sim.ep.signals["M2"]={name:"M2",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV M2_C2 BUS_IB","PLUS4 M2_C2 REG_PC"],depends_on:["C2"],fire_name:["svg_p:text3471"],draw_data:[["svg_p:path3217","svg_p:path3215","svg_p:path3213","svg_p:path3213-9"],["svg_p:path3211","svg_p:path3209","svg_p:path3193","svg_p:path3207","svg_p:path3197","svg_p:path3201"]],draw_name:[[],["svg_p:path3467","svg_p:path3467"]]};sim.ep.signals["M7"]={name:"M7",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV M7_C7 BUS_IB","MV M7_C7 SELP_M7"],depends_on:["C7"],fire_name:["svg_p:text3673"],draw_data:[["svg_p:path3691","svg_p:path3693","svg_p:path3659"],["svg_p:path3695"]],draw_name:[[],["svg_p:path3667"]]};sim.ep.signals["MA"]={name:"MA",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV MA_ALU RA_T9; FIRE COP","MV MA_ALU REG_RT1; FIRE COP"],depends_on:["SELA","SELB"],fire_name:["svg_p:text3463"],draw_data:[["svg_p:path3249","svg_p:path3161","svg_p:path3165"],["svg_p:path3279"]],draw_name:[[],["svg_p:path3423"]]};sim.ep.signals["MB"]={name:"MB",visible:true,type:"L",value:0,default_value:0,nbits:"2",behavior:["MV MB_ALU RB_T10; FIRE COP","MV MB_ALU REG_RT2; FIRE COP","MV MB_ALU VAL_FOUR; FIRE COP","MV MB_ALU VAL_ONE; FIRE COP"],depends_on:["SELA","SELB"],fire_name:["svg_p:text3465"],draw_data:[["svg_p:path3281","svg_p:path3171","svg_p:path3169"],["svg_p:path3283"],["svg_p:path3295","svg_p:path3293"],["svg_p:path3297","svg_p:path3299"]],draw_name:[[],["svg_p:path3425","svg_p:path3427"]]};sim.ep.signals["COP"]={name:"COP",visible:true,type:"L",value:0,default_value:0,nbits:"4",forbidden:true,behavior:["NOP_ALU; UPDATE_NZVC","AND ALU_C6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","OR ALU_C6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","NOT ALU_C6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","XOR ALU_C6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","SRL ALU_C6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","SRA ALU_C6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","SL ALU_C6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","RR ALU_C6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","RL ALU_C6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","ADD ALU_C6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","SUB ALU_C6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","MUL ALU_C6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","DIV ALU_C6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","MOD ALU_C6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3","LUI ALU_C6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET SELP 3"],depends_on:["SELCOP"],fire_name:["svg_p:text3303"],draw_data:[["svg_p:path3237","svg_p:path3239","svg_p:path3261-8","svg_p:path3321","svg_p:path3901-6","svg_p:path3317-9"]],draw_name:[["svg_p:path3009","svg_p:path3301"]]};sim.ep.signals["SELP"]={name:"SELP",visible:true,type:"L",value:0,default_value:0,nbits:"2",behavior:["NOP","MV SELP_M7 REG_SR; UPDATE_FLAG SELP_M7 FLAG_U 0; FIRE M7","MV SELP_M7 REG_SR; UPDATE_FLAG SELP_M7 FLAG_I 1; FIRE M7","MV SELP_M7 REG_SR; UPDATE_FLAG SELP_M7 FLAG_C 31; UPDATE_FLAG SELP_M7 FLAG_V 30; UPDATE_FLAG SELP_M7 FLAG_N 29; UPDATE_FLAG SELP_M7 FLAG_Z 28; FIRE M7"],fire_name:["svg_p:text3703"],draw_data:[[],["svg_p:path3643"],["svg_p:path3705"],["svg_p:path3675","svg_p:path3331"]],draw_name:[[],["svg_p:path3697"]]};sim.ep.signals["SELA"]={name:"SELA",visible:true,type:"L",value:0,default_value:0,nbits:"5",behavior:["FIRE MR_RA"],depends_on:["RA"],fire_name:["svg_cu:text3164"],draw_data:[[]],draw_name:[[]]};sim.ep.signals["SELB"]={name:"SELB",visible:true,type:"L",value:0,default_value:0,nbits:"5",behavior:["FIRE MR_RB"],depends_on:["RB"],fire_name:["svg_cu:text3168"],draw_data:[[]],draw_name:[[]]};sim.ep.signals["SELC"]={name:"SELC",visible:true,type:"L",value:0,default_value:0,nbits:"5",behavior:["FIRE MR_RC"],depends_on:["RC"],fire_name:["svg_cu:text3172"],draw_data:[[]],draw_name:[[]]};sim.ep.signals["SELCOP"]={name:"SELCOP",visible:true,type:"L",value:0,default_value:0,nbits:"4",behavior:["FIRE MC"],depends_on:["COP"],fire_name:["svg_cu:text3312"],draw_data:[[]],draw_name:[[]]};sim.ep.signals["EXCODE"]={name:"EXCODE",visible:true,type:"L",value:0,default_value:0,nbits:"4",behavior:["FIRE T11"],fire_name:["svg_cu:text3312-6"],draw_data:[[]],draw_name:[[]]};sim.ep.signals["RA"]={name:"RA",visible:true,type:"L",value:0,default_value:0,nbits:"5",forbidden:true,behavior:["GET RA_T9 BR RA; FIRE_IFSET T9 1; FIRE_IFSET MA 0"],depends_on:["SELA"],fire_name:["svg_p:text3107"],draw_data:[[]],draw_name:[["svg_p:path3109"]]};sim.ep.signals["RB"]={name:"RB",visible:true,type:"L",value:0,default_value:0,nbits:"5",forbidden:true,behavior:["GET RB_T10 BR RB; FIRE_IFSET T10 1; FIRE_IFSET MB 0"],depends_on:["SELB"],fire_name:["svg_p:text3123"],draw_data:[[]],draw_name:[["svg_p:path3113"]]};sim.ep.signals["RC"]={name:"RC",visible:true,type:"L",value:0,default_value:0,nbits:"5",forbidden:true,behavior:["FIRE LC"],depends_on:["SELC"],fire_name:["svg_p:text3125"],draw_data:[[]],draw_name:[["svg_p:path3117"]]};sim.ep.signals["LC"]={name:"LC",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","SET BR RC BUS_IB"],fire_name:["svg_p:text3127"],draw_data:[["svg_p:path3153","svg_p:path3151","svg_p:path3129"]],draw_name:[["svg_p:path3121"]]};sim.ep.signals["SE"]={name:"SE",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBITS SELEC_T3 0 REG_IR OFFSET SIZE 0 SE; FIRE T3; MOVE_BITS SBWA 4 1 SE; FIRE_IFCHANGED SBWA SE","MBITS SELEC_T3 0 REG_IR OFFSET SIZE 0 SE; FIRE T3; MOVE_BITS SBWA 4 1 SE; FIRE_IFCHANGED SBWA SE"],depends_on:["T3"],fire_name:["svg_p:text3593","svg_p:text3431"],draw_data:[[]],draw_name:[["svg_p:path3591","svg_p:path3447-7-7"]]};sim.ep.signals["SIZE"]={name:"SIZE",visible:true,type:"L",value:0,default_value:0,nbits:"5",behavior:["MBITS SELEC_T3 0 REG_IR OFFSET SIZE 0 SE; FIRE T3"],depends_on:["T3"],fire_name:["svg_p:text3363"],draw_data:[[]],draw_name:[["svg_p:path3355"]]};sim.ep.signals["OFFSET"]={name:"OFFSET",visible:true,type:"L",value:0,default_value:0,nbits:"5",behavior:["MBITS SELEC_T3 0 REG_IR OFFSET SIZE 0 SE; FIRE T3"],depends_on:["T3"],fire_name:["svg_p:text3707"],draw_data:[[]],draw_name:[["svg_p:path3359"]]};sim.ep.signals["MC"]={name:"MC",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBIT COP REG_IR 0 4; FIRE COP;","CP_FIELD COP REG_MICROINS/SELCOP; FIRE COP;"],depends_on:["SELCOP"],fire_name:["svg_cu:text3322","svg_cu:text3172-1-5"],draw_data:[["svg_cu:path3320","svg_cu:path3142"],["svg_cu:path3318","svg_cu:path3502-6","svg_cu:path3232-6"]],draw_name:[[],["svg_cu:path3306"]]};sim.ep.signals["MR"]={name:"MR",verbal:["Copy from IR[SelA], from IR[SelB], and from IR[SelB] into RA, RB, and RC. ","Copy SelA, SelB, and SelB into RA, RB, and RC. "],visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV MR_RA MR; FIRE MR_RA; MV MR_RB MR; FIRE MR_RB; MV MR_RC MR; FIRE MR_RC;","MV MR_RA MR; FIRE MR_RA; MV MR_RB MR; FIRE MR_RB; MV MR_RC MR; FIRE MR_RC;"],depends_on:["SELA","SELB","SELC"],fire_name:["svg_cu:text3222","svg_cu:text3242","svg_cu:text3254","svg_cu:text3172-1"],draw_data:[["svg_cu:path3494","svg_cu:path3492","svg_cu:path3490","svg_cu:path3142b","svg_cu:path3188","svg_cu:path3190","svg_cu:path3192","svg_cu:path3194","svg_cu:path3276","svg_cu:path3290","svg_cu:path3260","svg_cu:path3196","svg_cu:path3278","svg_cu:path3232","svg_cu:path3292"],["svg_cu:path3270","svg_cu:path3282","svg_cu:path3300","svg_cu:path3258","svg_cu:path3260","svg_cu:path3258-4","svg_cu:path3278","svg_cu:path3196","svg_cu:path3294","svg_cu:path3292","svg_cu:path3288","svg_cu:path3232","svg_cu:path3280"]],draw_name:[[],["svg_cu:path3220","svg_cu:path3240","svg_cu:path3252"]]};sim.ep.signals["MR_RA"]={name:"MR_RA",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBIT_SN RA REG_IR REG_MICROINS/SELA 5; FIRE RA;","CP_FIELD RA REG_MICROINS/SELA; FIRE RA;"],fire_name:[],draw_data:[[]],draw_name:[[]]};sim.ep.signals["MR_RB"]={name:"MR_RB",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBIT_SN RB REG_IR REG_MICROINS/SELB 5; FIRE RB;","CP_FIELD RB REG_MICROINS/SELB; FIRE RB;"],fire_name:[],draw_data:[[]],draw_name:[[]]};sim.ep.signals["MR_RC"]={name:"MR_RC",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBIT_SN RC REG_IR REG_MICROINS/SELC 5; FIRE RC;","CP_FIELD RC REG_MICROINS/SELC; FIRE RC;"],fire_name:[],draw_data:[[]],draw_name:[[]]};sim.ep.signals["BW"]={name:"BW",verbal:["Select one byte (based on A1A0) from Word. ","Select two bytes (one Half Word based on A1A0) from Word. ","","Select the full Word. "],visible:true,type:"L",value:0,default_value:0,nbits:"2",behavior:["MOVE_BITS BWA 2 2 BW; MOVE_BITS SBWA 2 2 BW; FIRE_IFCHANGED BWA BW; FIRE SBWA; RESET_CHANGED BW","MOVE_BITS BWA 2 2 BW; MOVE_BITS SBWA 2 2 BW; FIRE_IFCHANGED BWA BW; FIRE SBWA; RESET_CHANGED BW","MOVE_BITS BWA 2 2 BW; MOVE_BITS SBWA 2 2 BW; FIRE_IFCHANGED BWA BW; FIRE SBWA; RESET_CHANGED BW","MOVE_BITS BWA 2 2 BW; MOVE_BITS SBWA 2 2 BW; FIRE_IFCHANGED BWA BW; FIRE SBWA; RESET_CHANGED BW"],fire_name:["svg_p:text3433"],draw_data:[["svg_p:path3061-2-6","svg_p:path3101-8","svg_p:path3535-8"]],draw_name:[[],[]]};sim.ep.signals["A1A0"]={name:"A1A0",visible:true,type:"L",value:0,default_value:0,nbits:"2",behavior:["MOVE_BITS BWA 0 2 A1A0; MOVE_BITS SBWA 0 2 A1A0; FIRE BWA; FIRE SBWA","MOVE_BITS BWA 0 2 A1A0; MOVE_BITS SBWA 0 2 A1A0; FIRE BWA; FIRE SBWA","MOVE_BITS BWA 0 2 A1A0; MOVE_BITS SBWA 0 2 A1A0; FIRE BWA; FIRE SBWA","MOVE_BITS BWA 0 2 A1A0; MOVE_BITS SBWA 0 2 A1A0; FIRE BWA; FIRE SBWA"],fire_name:["svg_p:text3603"],draw_data:[[],[]],draw_name:[[],[]]};sim.ep.signals["BWA"]={name:"BWA",visible:false,type:"L",value:0,default_value:0,nbits:"4",behavior:["BSEL BS_TD 0 8 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 8 8 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 16 8 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 24 8 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 0 16 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 0 16 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 0 16 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 0 16 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 16 16 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 16 16 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 16 16 REG_MBR 0; FIRE TD; FIRE R; FIRE W","BSEL BS_TD 16 16 REG_MBR 0; FIRE TD; FIRE R; FIRE W","MV BS_TD REG_MBR; FIRE TD; FIRE R; FIRE W","MV BS_TD REG_MBR; FIRE TD; FIRE R; FIRE W","MV BS_TD REG_MBR; FIRE TD; FIRE R; FIRE W","MV BS_TD REG_MBR; FIRE TD; FIRE R; FIRE W"],fire_name:["svg_p:text3533-5"],draw_data:[[],[]],draw_name:[[],[]]};sim.ep.signals["SBWA"]={name:"SBWA",visible:false,type:"L",value:0,default_value:0,nbits:"5",behavior:["BSEL BS_M1 0 8 BUS_DB 0; FIRE M1","BSEL BS_M1 0 8 BUS_DB 8; FIRE M1","BSEL BS_M1 0 8 BUS_DB 16; FIRE M1","BSEL BS_M1 0 8 BUS_DB 24; FIRE M1","BSEL BS_M1 0 16 BUS_DB 0; FIRE M1","BSEL BS_M1 0 16 BUS_DB 0; FIRE M1","BSEL BS_M1 0 16 BUS_DB 0; FIRE M1","BSEL BS_M1 0 16 BUS_DB 0; FIRE M1","BSEL BS_M1 0 16 BUS_DB 16; FIRE M1","BSEL BS_M1 0 16 BUS_DB 16; FIRE M1","BSEL BS_M1 0 16 BUS_DB 16; FIRE M1","BSEL BS_M1 0 16 BUS_DB 16; FIRE M1","MV BS_M1 BUS_DB; FIRE M1","MV BS_M1 BUS_DB; FIRE M1","MV BS_M1 BUS_DB; FIRE M1","MV BS_M1 BUS_DB; FIRE M1","BSEL BS_M1 0 8 BUS_DB 0; EXT_SIG BS_M1 7; FIRE M1","BSEL BS_M1 0 8 BUS_DB 8; EXT_SIG BS_M1 7; FIRE M1","BSEL BS_M1 0 8 BUS_DB 16; EXT_SIG BS_M1 7; FIRE M1","BSEL BS_M1 0 8 BUS_DB 24; EXT_SIG BS_M1 7; FIRE M1","BSEL BS_M1 0 16 BUS_DB 0; EXT_SIG BS_M1 15; FIRE M1","BSEL BS_M1 0 16 BUS_DB 0; EXT_SIG BS_M1 15; FIRE M1","BSEL BS_M1 0 16 BUS_DB 0; EXT_SIG BS_M1 15; FIRE M1","BSEL BS_M1 0 16 BUS_DB 0; EXT_SIG BS_M1 15; FIRE M1","BSEL BS_M1 0 16 BUS_DB 16; EXT_SIG BS_M1 15; FIRE M1","BSEL BS_M1 0 16 BUS_DB 16; EXT_SIG BS_M1 15; FIRE M1","BSEL BS_M1 0 16 BUS_DB 16; EXT_SIG BS_M1 15; FIRE M1","BSEL BS_M1 0 16 BUS_DB 16; EXT_SIG BS_M1 15; FIRE M1","MV BS_M1 BUS_DB; FIRE M1","MV BS_M1 BUS_DB; FIRE M1","MV BS_M1 BUS_DB; FIRE M1","MV BS_M1 BUS_DB; FIRE M1"],fire_name:[],draw_data:[[],[]],draw_name:[[],[]]};sim.ep.signals["IOR"]={name:"IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MOVE_BITS KBD_IOR 0 1 IOR; MOVE_BITS SCR_IOR 0 1 IOR; MOVE_BITS L3D_IOR 0 1 IOR; FIRE KBD_IOR; FIRE SCR_IOR; FIRE L3D_IOR"],fire_name:["svg_p:text3715"],draw_data:[[],["svg_p:path3733","svg_p:path3491","svg_p:text3715"]],draw_name:[[],[]]};sim.ep.signals["IOW"]={name:"IOW",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MOVE_BITS SCR_IOW 0 1 IOW; FIRE SCR_IOW; MOVE_BITS IO_IOW 0 1 IOW; FIRE IO_IOW; MOVE_BITS L3D_IOW 0 1 IOW; FIRE L3D_IOW"],fire_name:["svg_p:text3717"],draw_data:[[],["svg_p:path3735","svg_p:path3491","svg_p:text3717"]],draw_name:[[],[]]};sim.ep.signals["I"]={name:"I",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV FLAG_I VAL_ZERO; FIRE_IFSET SELP 2","MV FLAG_I VAL_ONE; FIRE_IFSET SELP 2"],fire_name:[],draw_data:[[],[]],draw_name:[[],[]]};sim.ep.signals["U"]={name:"U",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV FLAG_U VAL_ZERO; FIRE_IFSET SELP 2","MV FLAG_U VAL_ONE; FIRE_IFSET SELP 2"],fire_name:[],draw_data:[[],[]],draw_name:[[],[]]};sim.ep.signals["TEST_C"]={name:"TEST_C",visible:true,type:"L",value:0,default_value:0,nbits:"1",forbidden:true,behavior:["MV FLAG_C VAL_ZERO; FIRE_IFSET SELP 2","MV FLAG_C VAL_ONE; FIRE_IFSET SELP 3"],depends_on:["SELCOP","COP"],fire_name:["svg_p:text3701-3"],draw_data:[["svg_p:text3701-3"]],draw_name:[[]]};sim.ep.signals["TEST_V"]={name:"TEST_V",visible:true,type:"L",value:0,default_value:0,nbits:"1",forbidden:true,behavior:["MV FLAG_V VAL_ZERO; FIRE_IFSET SELP 2","MV FLAG_V VAL_ONE; FIRE_IFSET SELP 3"],depends_on:["SELCOP","COP"],fire_name:["svg_p:text3701-3-1"],draw_data:[["svg_p:text3701-3-1"]],draw_name:[[]]};sim.ep.signals["TEST_N"]={name:"TEST_N",visible:true,type:"L",value:0,default_value:0,nbits:"1",forbidden:true,behavior:["MV FLAG_N VAL_ZERO; FIRE_IFSET SELP 2","MV FLAG_N VAL_ONE; FIRE_IFSET SELP 3"],depends_on:["SELCOP","COP"],fire_name:["svg_p:text3701-3-2"],draw_data:[["svg_p:text3701-3-2"]],draw_name:[[]]};sim.ep.signals["TEST_Z"]={name:"TEST_Z",visible:true,type:"L",value:0,default_value:0,nbits:"1",forbidden:true,behavior:["MV FLAG_Z VAL_ZERO; FIRE_IFSET SELP 2","MV FLAG_Z VAL_ONE; FIRE_IFSET SELP 3"],depends_on:["SELCOP","COP"],fire_name:["svg_p:text3701-3-5"],draw_data:[["svg_p:text3701-3-5"]],draw_name:[[]]};sim.ep.signals["TEST_I"]={name:"TEST_I",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV FLAG_I VAL_ZERO; FIRE_IFSET SELP 2","MV FLAG_I VAL_ONE; FIRE_IFSET SELP 2"],depends_on:["CLK"],fire_name:["svg_p:text3669"],draw_data:[["svg_p:text3669"]],draw_name:[[]]};sim.ep.signals["TEST_U"]={name:"TEST_U",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV FLAG_U VAL_ZERO; FIRE_IFSET SELP 1","MV FLAG_U VAL_ONE; FIRE_IFSET SELP 1"],depends_on:["CLK"],fire_name:["svg_p:text3669-1"],draw_data:[["svg_p:text3669-1"]],draw_name:[[]]};sim.ep.signals["TEST_INTV"]={name:"TEST_INTV",visible:true,type:"L",value:0,default_value:0,nbits:"8",forbidden:true,behavior:["MBIT INTV TEST_INTV 0 32"],depends_on:["INT"],fire_name:["svg_p:tspan4225"],draw_data:[["svg_p:path3749"]],draw_name:[[]]};sim.ep.behaviors["NOP"]={nparameters:1,operation:function(s_expr){},verbal:function(s_expr){return""}};sim.ep.behaviors["NOP_ALU"]={nparameters:1,operation:function(s_expr){sim.ep.internal_states.alu_flags.flag_n=0;sim.ep.internal_states.alu_flags.flag_z=0;sim.ep.internal_states.alu_flags.flag_c=0;sim.ep.internal_states.alu_flags.flag_v=0},verbal:function(s_expr){return""}};sim.ep.behaviors["MV"]={nparameters:3,types:["X","X"],operation:function(s_expr){sim_elto_org=get_reference(s_expr[2]);sim_elto_dst=get_reference(s_expr[1]);newval=get_value(sim_elto_org);set_value(sim_elto_dst,newval)},verbal:function(s_expr){var sim_elto_org=get_reference(s_expr[2]);var newval=get_value(sim_elto_org);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy from "+show_verbal(s_expr[2])+" to "+show_verbal(s_expr[1])+" value "+show_value(newval)+". "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[2])+" ("+show_value(newval)+"). "}};sim.ep.behaviors["LOAD"]={nparameters:3,types:["X","X"],operation:function(s_expr){sim_elto_org=get_reference(s_expr[2]);sim_elto_dst=get_reference(s_expr[1]);newval=get_value(sim_elto_org);set_value(sim_elto_dst,newval)},verbal:function(s_expr){var sim_elto_org=get_reference(s_expr[2]);var newval=get_value(sim_elto_org);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Load from "+show_verbal(s_expr[2])+" to "+show_verbal(s_expr[1])+" value "+show_value(newval)+". "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[2])+" ("+show_value(newval)+"). "}};sim.ep.behaviors["CP_FIELD"]={nparameters:3,types:["X","X"],operation:function(s_expr){r=s_expr[2].split("/");sim_elto_org=get_reference(r[0]);newval=get_value(sim_elto_org);newval=newval[r[1]];if(typeof newval!="undefined"){sim_elto_dst=get_reference(s_expr[1]);set_value(sim_elto_dst,newval)}},verbal:function(s_expr){var r=s_expr[2].split("/");var sim_elto_org=get_reference(r[0]);var newval=get_value(sim_elto_org);newval=newval[r[1]];if(typeof newval=="undefined")newval="&lt;undefined&gt;";else newval=show_value(newval);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy from Field "+r[1]+" of "+show_verbal(r[0])+" to "+show_verbal(s_expr[1])+" value "+newval+". "}return show_verbal(s_expr[1])+" = "+show_verbal(r[0])+"."+r[1]+" ("+newval+"). "}};sim.ep.behaviors["NOT_ES"]={nparameters:3,types:["S","E"],operation:function(s_expr){set_value(sim.ep.signals[s_expr[1]],Math.abs(get_value(sim.ep.states[s_expr[2]])-1))},verbal:function(s_expr){var value=Math.abs(get_value(sim.ep.states[s_expr[2]])-1);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Set "+show_verbal(s_expr[1])+" with value "+show_value(value)+" (Logical NOT of "+s_expr[2]+"). "}return show_verbal(s_expr[1])+" = "+show_value(value)+" (Logical NOT "+s_expr[2]+"). "}};sim.ep.behaviors["GET"]={nparameters:4,types:["E","E","S"],operation:function(s_expr){set_value(sim.ep.states[s_expr[1]],get_value(sim.ep.states[s_expr[2]][sim.ep.signals[s_expr[3]].value]))},verbal:function(s_expr){var value=get_value(sim.ep.states[s_expr[2]][sim.ep.signals[s_expr[3]].value]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Set "+show_verbal(s_expr[1])+" with value "+show_value(value)+" (Register File "+s_expr[3]+"). "}return show_verbal(s_expr[1])+" = "+show_value(value)+" (Register File "+s_expr[3]+"). "}};sim.ep.behaviors["SET"]={nparameters:4,types:["E","S","E"],operation:function(s_expr){set_value(sim.ep.states[s_expr[1]][sim.ep.signals[s_expr[2]].value],get_value(sim.ep.states[s_expr[3]]))},verbal:function(s_expr){var value=get_value(sim.ep.states[s_expr[3]]);var o_ref=sim.ep.states[s_expr[1]][sim.ep.signals[s_expr[2]].value];var o_verbal=o_ref.name;if(typeof o_ref.verbal!="undefined")o_verbal=o_ref.verbal;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy to "+o_verbal+" the value "+show_value(value)+". "}return o_verbal+" = "+show_value(value)+". "}};sim.ep.behaviors["AND"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])&get_value(sim.ep.states[s_expr[3]]);set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])&get_value(sim.ep.states[s_expr[3]]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU AND with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (AND). "}};sim.ep.behaviors["OR"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])|get_value(sim.ep.states[s_expr[3]]);set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])|get_value(sim.ep.states[s_expr[3]]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU OR with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (OR). "}};sim.ep.behaviors["NOT"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=~get_value(sim.ep.states[s_expr[2]]);set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=~get_value(sim.ep.states[s_expr[2]]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU NOT with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (NOT). "}};sim.ep.behaviors["XOR"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])^get_value(sim.ep.states[s_expr[3]]);set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])^get_value(sim.ep.states[s_expr[3]]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU XOR with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (XOR). "}};sim.ep.behaviors["SRL"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])>>>1;set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])>>>1;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Shift Right Logical with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (SRL). "}};sim.ep.behaviors["SRA"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])>>1;set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])>>1;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Shift Right Arithmetic with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (SRA). "}};sim.ep.behaviors["SL"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])<<1;set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=result>>>31},verbal:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])<<1;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Shift Left with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (SL). "}};sim.ep.behaviors["RR"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])>>>1|(get_value(sim.ep.states[s_expr[2]])&1)<<31;set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])>>>1|(get_value(sim.ep.states[s_expr[2]])&1)<<31;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Right Rotation with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (RR). "}};sim.ep.behaviors["RL"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])<<1|(get_value(sim.ep.states[s_expr[2]])&2147483648)>>>31;set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])<<1|(get_value(sim.ep.states[s_expr[2]])&2147483648)>>>31;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Left Rotation with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (LR). "}};sim.ep.behaviors["ADD"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;var result=a+b;set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_c=a>>>31&&b>>>31;sim.ep.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.ep.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.ep.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;var result=a+b;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU ADD with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (ADD). "}};sim.ep.behaviors["SUB"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;var result=a-b;set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_c=a>>>31&&b>>>31;sim.ep.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.ep.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.ep.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;var result=a-b;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU SUB with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (SUB). "}};sim.ep.behaviors["MUL"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;var result=a*b;set_value(sim.ep.states[s_expr[1]],result>>>0);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_c=0;sim.ep.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.ep.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.ep.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;var result=a*b;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU MUL with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (MUL). "}};sim.ep.behaviors["DIV"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;if(0==b){set_value(sim.ep.states[s_expr[1]],0);sim.ep.internal_states.alu_flags.flag_n=0;sim.ep.internal_states.alu_flags.flag_z=1;sim.ep.internal_states.alu_flags.flag_v=1;sim.ep.internal_states.alu_flags.flag_c=0;return}var result=Math.floor(a/b);set_value(sim.ep.states[s_expr[1]],result);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;if(0==b){return"ALU DIV zero by zero (oops!). "}var result=Math.floor(a/b);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU DIV with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (DIV). "}};sim.ep.behaviors["MOD"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;if(0==b){set_value(sim.ep.states[s_expr[1]],0);sim.ep.internal_states.alu_flags.flag_n=0;sim.ep.internal_states.alu_flags.flag_z=1;sim.ep.internal_states.alu_flags.flag_v=1;sim.ep.internal_states.alu_flags.flag_c=0;return}var result=a%b;set_value(sim.ep.states[s_expr[1]],result);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var b=get_value(sim.ep.states[s_expr[3]])<<0;if(0==b){return"ALU MOD zero by zero (oops!). "}var result=a%b;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU MOD with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (MOD). "}};sim.ep.behaviors["LUI"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])<<16;set_value(sim.ep.states[s_expr[1]],result);sim.ep.internal_states.alu_flags.flag_n=result<0?1:0;sim.ep.internal_states.alu_flags.flag_z=result==0?1:0;sim.ep.internal_states.alu_flags.flag_v=0;sim.ep.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.ep.states[s_expr[2]])<<16;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Load Upper Immediate with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (LUI). "}};sim.ep.behaviors["PLUS1"]={nparameters:3,types:["E","E"],operation:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var result=a+1;set_value(sim.ep.states[s_expr[1]],result>>>0)},verbal:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var result=a+1;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy to "+show_verbal(s_expr[1])+" "+show_verbal(s_expr[2])+" plus one with result "+show_value(result)+". "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[2])+" + 1"+" ("+show_value(result)+"). "}};sim.ep.behaviors["PLUS4"]={nparameters:3,types:["E","E"],operation:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var result=a+4;set_value(sim.ep.states[s_expr[1]],result>>>0)},verbal:function(s_expr){var a=get_value(sim.ep.states[s_expr[2]])<<0;var result=a+4;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy to "+show_verbal(s_expr[1])+" "+show_verbal(s_expr[2])+" plus four with result "+show_value(result)+". "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[2])+" + 4"+" ("+show_value(result)+"). "}};sim.ep.behaviors["MBIT"]={nparameters:5,types:["X","X","I","I"],operation:function(s_expr){var sim_elto_dst=get_reference(s_expr[1]);var sim_elto_org=get_reference(s_expr[2]);var offset=parseInt(s_expr[3]);var size=parseInt(s_expr[4]);var n1=get_value(sim_elto_org).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(offset+size-1),size);set_value(sim_elto_dst,parseInt(n2,2))},verbal:function(s_expr){var sim_elto_dst=get_reference(s_expr[1]);var sim_elto_org=get_reference(s_expr[2]);var offset=parseInt(s_expr[3]);var size=parseInt(s_expr[4]);var n1=get_value(sim_elto_org).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(offset+size-1),size);var n3=parseInt(n2,2);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy from "+show_verbal(s_expr[2])+" to "+show_verbal(s_expr[1])+" value "+show_value(n3)+" (copied "+size+" bits from bit "+offset+"). "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[2])+" ("+show_value(n3)+", "+size+" bits from bit "+offset+"). "}};sim.ep.behaviors["MBIT_SN"]={nparameters:5,types:["S","E","E","I"],operation:function(s_expr){var base=0;var r=s_expr[3].split("/");if(1==r.length)base=get_value(sim.ep.states[s_expr[3]]);else if(typeof sim.ep.states[r[0]].value[r[1]]!="undefined")base=sim.ep.states[r[0]].value[r[1]];else if(typeof sim.ep.signals[r[1]].default_value!="undefined")base=sim.ep.signals[r[1]].default_value;else if(typeof sim.ep.states[r[1]].default_value!="undefined")base=sim.ep.states[r[1]].default_value;else ws_alert("WARN: undefined state/field pair -> "+r[0]+"/"+r[1]);var offset=parseInt(s_expr[4]);var n1=get_value(sim.ep.states[s_expr[2]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;var n3=n2.substr(31-(base+offset-1),offset);set_value(sim.ep.signals[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){var base=0;var r=s_expr[3].split("/");if(1==r.length)base=get_value(sim.ep.states[s_expr[3]]);else if(typeof sim.ep.states[r[0]].value[r[1]]!="undefined")base=sim.ep.states[r[0]].value[r[1]];else if(typeof sim.ep.signals[r[1]].default_value!="undefined")base=sim.ep.signals[r[1]].default_value;else if(typeof sim.ep.states[r[1]].default_value!="undefined")base=sim.ep.states[r[1]].default_value;else ws_alert("WARN: undefined state/field pair -> "+r[0]+"/"+r[1]);var offset=parseInt(s_expr[4]);var n1=get_value(sim.ep.states[s_expr[2]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;var n3=n2.substr(31-(base+offset-1),offset);var from_elto="";if(1==r.length)from_elto=show_verbal(s_expr[3]);else from_elto=show_verbal(s_expr[2])+"["+r[1]+"] ";var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy from "+from_elto+"into "+show_verbal(s_expr[1])+" "+"value "+parseInt(n3,2)+". "}return show_verbal(s_expr[1])+" = "+from_elto+" ("+parseInt(n3,2)+"). "}};sim.ep.behaviors["SBIT_SIGNAL"]={nparameters:4,types:["X","I","I"],operation:function(s_expr){sim_elto_dst=get_reference(s_expr[1]);var new_value=sim_elto_dst.value;var mask=1<<s_expr[3];if(s_expr[2]=="1")new_value=new_value|mask;else new_value=new_value&~mask;set_value(sim_elto_dst,new_value>>>0)},verbal:function(s_expr){sim_elto_dst=get_reference(s_expr[1]);var new_value=sim_elto_dst.value;var mask=1<<s_expr[3];if(s_expr[2]=="1")new_value=new_value|mask;else new_value=new_value&~mask;return compute_signal_verbals(s_expr[1],new_value>>>0)}};sim.ep.behaviors["UPDATE_FLAG"]={nparameters:4,types:["X","X","I"],operation:function(s_expr){sim_elto_org=get_reference(s_expr[2]);sim_elto_dst=get_reference(s_expr[1]);var new_value=sim_elto_dst.value&~(1<<s_expr[3])|sim_elto_org.value<<s_expr[3];set_value(sim_elto_dst,new_value>>>0)},verbal:function(s_expr){sim_elto_org=get_reference(s_expr[2]);sim_elto_dst=get_reference(s_expr[1]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Update "+show_verbal(s_expr[2])+" to value "+sim_elto_org.value+". "}return show_verbal(s_expr[1])+"."+show_verbal(s_expr[3])+" = "+sim_elto_org.value+". "}};sim.ep.behaviors["MBITS"]={nparameters:8,types:["E","I","E","S","S","I","S"],operation:function(s_expr){var offset=parseInt(sim.ep.signals[s_expr[4]].value);var size=parseInt(sim.ep.signals[s_expr[5]].value);var n1=get_value(sim.ep.states[s_expr[3]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(offset+size-1),size);var n3="00000000000000000000000000000000".substring(0,32-n2.length)+n2;if("1"==sim.ep.signals[s_expr[7]].value&&"1"==n2.substr(0,1)){n3="11111111111111111111111111111111".substring(0,32-n2.length)+n2}set_value(sim.ep.states[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){var offset=parseInt(sim.ep.signals[s_expr[4]].value);var size=parseInt(sim.ep.signals[s_expr[5]].value);var n1=get_value(sim.ep.states[s_expr[3]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(offset+size-1),size);var n3="00000000000000000000000000000000".substring(0,32-n2.length)+n2;if("1"==sim.ep.signals[s_expr[7]].value&&"1"==n2.substr(0,1)){n3="11111111111111111111111111111111".substring(0,32-n2.length)+n2}n1=parseInt(n3,2);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return" Copy from "+show_verbal(s_expr[3])+" to "+show_verbal(s_expr[1])+" value "+show_value(n1)+" (copied "+size+" bits from bit "+offset+"). "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[3])+" ("+show_value(n1)+", "+size+" bits from bit "+offset+"). "}};sim.ep.behaviors["BSEL"]={nparameters:6,types:["E","I","I","E","I"],operation:function(s_expr){var posd=parseInt(s_expr[2]);var poso=parseInt(s_expr[5]);var len=parseInt(s_expr[3]);var n1=get_value(sim.ep.states[s_expr[4]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(poso+len)+1,len);var n3="00000000000000000000000000000000".substring(0,32-n2.length)+n2;var n4="00000000000000000000000000000000".substr(0,posd);n3=n3+n4;set_value(sim.ep.states[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){var posd=parseInt(s_expr[2]);var len=parseInt(s_expr[3]);var poso=parseInt(s_expr[5]);var n1=get_value(sim.ep.states[s_expr[4]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(poso+len)+1,len);var n3="00000000000000000000000000000000".substring(0,32-n2.length)+n2;var n4="00000000000000000000000000000000".substr(0,posd);n3=n3+n4;var n5=parseInt(n3,2);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy from "+show_verbal(s_expr[4])+" to "+show_verbal(s_expr[1])+" value "+show_value(n5)+" (copied "+len+" bits, from bit "+poso+" of "+s_expr[4]+" to bit "+posd+" of "+s_expr[1]+"). "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[4])+" ("+show_value(n5)+", "+len+" bits, from bit "+poso+" of "+s_expr[4]+" to bit "+posd+" of "+s_expr[1]+"). "}};sim.ep.behaviors["EXT_SIG"]={nparameters:3,types:["E","I"],operation:function(s_expr){var n1=get_value(sim.ep.states[s_expr[1]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;var n3=n2.substr(31-s_expr[2],31);var n4=n3;if("1"==n2[31-s_expr[2]]){n4="11111111111111111111111111111111".substring(0,32-n3.length)+n4}set_value(sim.ep.states[s_expr[1]],parseInt(n4,2))},verbal:function(s_expr){var n1=get_value(sim.ep.states[s_expr[1]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;var n3=n2.substr(31-s_expr[2],31);var n4=n3;if("1"==n2[31-s_expr[2]]){n4="11111111111111111111111111111111".substring(0,32-n3.length)+n4}var n5=parseInt(n4,2);return"Sign Extension with value "+show_value(n5)+". "}};sim.ep.behaviors["MOVE_BITS"]={nparameters:5,types:["S","I","I","S"],operation:function(s_expr){var posd=parseInt(s_expr[2]);var poso=0;var len=parseInt(s_expr[3]);var n1=sim.ep.signals[s_expr[4]].value.toString(2);n1="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n1=n1.substr(31-poso-len+1,len);var n2=sim.ep.signals[s_expr[1]].value.toString(2);n2="00000000000000000000000000000000".substring(0,32-n2.length)+n2;var m1=n2.substr(0,32-(posd+len));var m2=n2.substr(31-posd+1,posd);var n3=m1+n1+m2;set_value(sim.ep.signals[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){return""}};sim.ep.behaviors["MOVE_BITSE"]={nparameters:6,types:["S","I","I","E","I"],operation:function(s_expr){var posd=parseInt(s_expr[2]);var poso=parseInt(s_expr[5]);var len=parseInt(s_expr[3]);var n1=get_value(sim.ep.states[s_expr[4]]).toString(2);n1="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n1=n1.substr(31-poso-len+1,len);var n2=sim.ep.signals[s_expr[1]].value.toString(2);n2="00000000000000000000000000000000".substring(0,32-n2.length)+n2;var m1=n2.substr(0,32-(posd+len));var m2=n2.substr(31-posd+1,posd);var n3=m1+n1+m2;set_value(sim.ep.signals[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){return""}};sim.ep.behaviors["DECO"]={nparameters:1,operation:function(s_expr){sim.ep.states["INEX"].value=0;var oi=decode_instruction(sim.ep.internal_states.FIRMWARE,sim.ep.ctrl_states.ir,get_value(sim.ep.states["REG_IR"]));if(null==oi.oinstruction){ws_alert("ERROR: undefined instruction code in firmware ("+"co:"+oi.op_code.toString(2)+", "+"cop:"+oi.cop_code.toString(2)+")");sim.ep.states["ROM_MUXA"].value=0;sim.ep.states["INEX"].value=1;return-1}var rom_addr=oi.op_code<<6;if(typeof oi.oinstruction.cop!="undefined"){rom_addr=rom_addr+oi.cop_code}if(typeof sim.ep.internal_states["ROM"][rom_addr]=="undefined"){ws_alert("ERROR: undefined rom address "+rom_addr+" in firmware");sim.ep.states["ROM_MUXA"].value=0;return-1}sim.ep.states["ROM_MUXA"].value=sim.ep.internal_states["ROM"][rom_addr];var val=get_value(sim.ep.states["DECO_INS"]);set_value(sim.ep.states["DECO_INS"],val+1);var pc=get_value(sim.ep.states["REG_PC"])-4;var decins=get_deco_from_pc(pc);set_value(sim.ep.states["REG_IR_DECO"],decins);show_dbg_ir(get_value(sim.ep.states["REG_IR_DECO"]))},verbal:function(s_expr){return"Decode instruction. "}};sim.ep.behaviors["FIRE"]={nparameters:2,types:["S"],operation:function(s_expr){if(sim.ep.internal_states.fire_stack.indexOf(s_expr[1])!=-1){return}sim.ep.internal_states.fire_stack.push(s_expr[1]);update_draw(sim.ep.signals[s_expr[1]],sim.ep.signals[s_expr[1]].value);if("L"==sim.ep.signals[s_expr[1]].type){update_state(s_expr[1])}sim.ep.internal_states.fire_stack.pop(s_expr[1]);check_buses(s_expr[1])},verbal:function(s_expr){return""}};sim.ep.behaviors["FIRE_IFSET"]={nparameters:3,types:["S","I"],operation:function(s_expr){if(get_value(sim.ep.signals[s_expr[1]])!=parseInt(s_expr[2])){return}sim.ep.behaviors["FIRE"].operation(s_expr)},verbal:function(s_expr){return""}};sim.ep.behaviors["FIRE_IFCHANGED"]={nparameters:3,types:["S","X"],operation:function(s_expr){sim_elto=get_reference(s_expr[2]);if(sim_elto.changed==false){return}sim.ep.behaviors["FIRE"].operation(s_expr)},verbal:function(s_expr){return""}};sim.ep.behaviors["RESET_CHANGED"]={nparameters:2,types:["X"],operation:function(s_expr){sim_elto=get_reference(s_expr[1]);sim_elto.changed=false},verbal:function(s_expr){return""}};sim.ep.behaviors["CLOCK"]={nparameters:1,operation:function(s_expr){var val=get_value(sim.ep.states["CLK"]);set_value(sim.ep.states["CLK"],val+1);for(var i=0;i<jit_fire_order.length;i++){fn_updateE_now(jit_fire_order[i])}var new_maddr=get_value(sim.ep.states["MUXA_MICROADDR"]);set_value(sim.ep.states["REG_MICROADDR"],new_maddr);if(typeof sim.ep.internal_states["MC"][new_maddr]!="undefined")var new_mins=Object.create(sim.ep.internal_states["MC"][new_maddr]);else var new_mins=Object.create(sim.ep.states["REG_MICROINS"].default_value);sim.ep.states["REG_MICROINS"].value=new_mins;for(var key in sim.ep.signals){if(typeof new_mins[key]!="undefined")set_value(sim.ep.signals[key],new_mins[key]);else set_value(sim.ep.signals[key],sim.ep.signals[key].default_value)}for(var i=0;i<jit_fire_order.length;i++){fn_updateL_now(jit_fire_order[i])}if(typeof new_mins.NATIVE_JIT!="undefined")new_mins.NATIVE_JIT();else if(typeof new_mins.NATIVE!="undefined")eval(new_mins.NATIVE)},verbal:function(s_expr){return""}};sim.ep.behaviors["CPU_RESET"]={nparameters:1,operation:function(s_expr){for(var key in sim.ep.states){reset_value(sim.ep.states[key])}for(var key in sim.ep.signals){reset_value(sim.ep.signals[key])}},verbal:function(s_expr){return"Reset CPU. "}};sim.ep.behaviors["UPDATEDPC"]={nparameters:1,operation:function(s_expr){show_asmdbg_pc()},verbal:function(s_expr){return""}};sim.ep.behaviors["UPDATE_NZVC"]={nparameters:1,operation:function(s_expr){set_value(simhw_sim_state("FLAG_N"),sim.ep.internal_states.alu_flags.flag_n);set_value(simhw_sim_state("FLAG_Z"),sim.ep.internal_states.alu_flags.flag_z);set_value(simhw_sim_state("FLAG_V"),sim.ep.internal_states.alu_flags.flag_v);set_value(simhw_sim_state("FLAG_C"),sim.ep.internal_states.alu_flags.flag_c);set_value(simhw_sim_signal("TEST_N"),sim.ep.internal_states.alu_flags.flag_n);set_value(simhw_sim_signal("TEST_Z"),sim.ep.internal_states.alu_flags.flag_z);set_value(simhw_sim_signal("TEST_V"),sim.ep.internal_states.alu_flags.flag_v);set_value(simhw_sim_signal("TEST_C"),sim.ep.internal_states.alu_flags.flag_c);update_draw(sim.ep.signals["TEST_N"],sim.ep.signals["TEST_N"].value);update_draw(sim.ep.signals["TEST_Z"],sim.ep.signals["TEST_Z"].value);update_draw(sim.ep.signals["TEST_V"],sim.ep.signals["TEST_V"].value);update_draw(sim.ep.signals["TEST_C"],sim.ep.signals["TEST_C"].value)},verbal:function(s_expr){return"Update flags N-Z-V-C."}};sim.ep.components.MEMORY={name:"MEMORY",version:"1",abilities:["MEMORY"],details_name:["MEMORY","MEMORY_CONFIG"],details_fire:[["svg_p:text3001"],[]],write_state:function(vec){if(typeof vec.MEMORY=="undefined")vec.MEMORY={};var key=0;var value=0;for(var index in sim.ep.internal_states.MP){value=parseInt(sim.ep.internal_states.MP[index]);if(value!=0){key=parseInt(index).toString(16);vec.MEMORY["0x"+key]={type:"memory",default_value:0,id:"0x"+key,op:"=",value:"0x"+value.toString(16)}}}return vec},read_state:function(vec,check){if(typeof vec.MEMORY=="undefined")vec.MEMORY={};var key=parseInt(check.id).toString(16);var val=parseInt(check.value).toString(16);if("MEMORY"==check.type.toUpperCase().trim()){vec.MEMORY["0x"+key]={type:"memory",default_value:0,id:"0x"+key,op:check.condition,value:"0x"+val};return true}return false},get_state:function(pos){var index=parseInt(pos);if(typeof sim.ep.internal_states.MP[index]!="undefined"){return"0x"+parseInt(sim.ep.internal_states.MP[index]).toString(16)}return null},get_value:function(elto){return simhw_internalState_get("MP",elto)>>>0},set_value:function(elto,value){simhw_internalState_set("MP",elto,value);return value}};sim.ep.internal_states.segments={};sim.ep.internal_states.MP={};sim.ep.internal_states.MP_wc=0;sim.ep.signals.MRDY={name:"MRDY",visible:true,type:"L",value:0,default_value:0,nbits:"1",depends_on:["CLK"],behavior:["FIRE_IFCHANGED MRDY C","FIRE_IFCHANGED MRDY C"],fire_name:["svg_p:tspan3916","svg_p:text3909"],draw_data:[[],["svg_p:path3895","svg_p:path3541"]],draw_name:[[],[]]};sim.ep.signals.R={name:"R",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MEM_READ BUS_AB BUS_DB BWA MRDY CLK; FIRE MRDY"],fire_name:["svg_p:text3533-5-2","svg_p:text3713"],draw_data:[[],["svg_p:path3557","svg_p:path3571"]],draw_name:[[],[]]};sim.ep.signals.W={name:"W",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MEM_WRITE BUS_AB BUS_DB BWA MRDY CLK; FIRE MRDY"],fire_name:["svg_p:text3533-5-08","svg_p:text3527","svg_p:text3431-7"],draw_data:[[],["svg_p:path3559","svg_p:path3575","svg_p:path3447-7"]],draw_name:[[],[]]};sim.ep.behaviors.MEM_READ={nparameters:6,types:["E","E","S","S","E"],operation:function(s_expr){var address=sim.ep.states[s_expr[1]].value;var dbvalue=sim.ep.states[s_expr[2]].value;var bw=sim.ep.signals[s_expr[3]].value;var clk=get_value(sim.ep.states[s_expr[5]].value);sim.ep.signals[s_expr[4]].value=0;var remain=get_var(sim.ep.internal_states.MP_wc);if(typeof sim.ep.events.mem[clk-1]!="undefined"&&sim.ep.events.mem[clk-1]>0){remain=sim.ep.events.mem[clk-1]-1}sim.ep.events.mem[clk]=remain;if(remain>0){return}var value=0;address=address&4294967292;if(typeof sim.ep.internal_states.MP[address]!="undefined")value=sim.ep.internal_states.MP[address];if(0==(bw&12)){if(0==(bw&3))dbvalue=dbvalue&4294967040|value&255;if(1==(bw&3))dbvalue=dbvalue&4294902015|value&65280;if(2==(bw&3))dbvalue=dbvalue&4278255615|value&16711680;if(3==(bw&3))dbvalue=dbvalue&16777215|value&4278190080}else if(1==(bw&12)){if(0==(bw&2))dbvalue=dbvalue&4294901760|value&65535;if(1==(bw&2))dbvalue=dbvalue&65535|value&4294901760}else{dbvalue=value}sim.ep.states[s_expr[2]].value=dbvalue>>>0;sim.ep.signals[s_expr[4]].value=1;show_main_memory(sim.ep.internal_states.MP,address,false,false)},verbal:function(s_expr){var verbal="";var address=sim.ep.states[s_expr[1]].value;var dbvalue=sim.ep.states[s_expr[2]].value;var bw=sim.ep.signals[s_expr[3]].value;var clk=get_value(sim.ep.states[s_expr[5]].value);var bw_type="word";if(0==(bw&12))bw_type="byte";else if(1==(bw&12))bw_type="half";var value=0;if(typeof sim.ep.internal_states.MP[address]!="undefined")value=sim.ep.internal_states.MP[address];var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){verbal="Try to read a "+bw_type+" from memory "+"at address 0x"+address.toString(16)+" with value 0x"+value.toString(16)+". "}verbal="Memory output = 0x"+value.toString(16)+" (Read a "+bw_type+" from 0x"+address.toString(16)+"). ";return verbal}};sim.ep.behaviors.MEM_WRITE={nparameters:6,types:["E","E","S","S","E"],operation:function(s_expr){var address=sim.ep.states[s_expr[1]].value;var dbvalue=sim.ep.states[s_expr[2]].value;var bw=sim.ep.signals[s_expr[3]].value;var clk=get_value(sim.ep.states[s_expr[5]].value);sim.ep.signals[s_expr[4]].value=0;var remain=get_var(sim.ep.internal_states.MP_wc);if(typeof sim.ep.events.mem[clk-1]!="undefined"&&sim.ep.events.mem[clk-1]>0){remain=sim.ep.events.mem[clk-1]-1}sim.ep.events.mem[clk]=remain;if(remain>0)return;var value=0;address=address&4294967292;if(typeof sim.ep.internal_states.MP[address]!="undefined")value=sim.ep.internal_states.MP[address];if(0==(bw&12)){if(0==(bw&3))value=value&4294967040|dbvalue&255;if(1==(bw&3))value=value&4294902015|dbvalue&65280;if(2==(bw&3))value=value&4278255615|dbvalue&16711680;if(3==(bw&3))value=value&16777215|dbvalue&4278190080}else if(1==(bw&12)){if(0==(bw&2))value=value&4294901760|dbvalue&65535;if(1==(bw&2))value=value&65535|dbvalue&4294901760}else{value=dbvalue}sim.ep.internal_states.MP[address]=value>>>0;sim.ep.signals[s_expr[4]].value=1;show_main_memory(sim.ep.internal_states.MP,address,true,true)},verbal:function(s_expr){var verbal="";var address=sim.ep.states[s_expr[1]].value;var dbvalue=sim.ep.states[s_expr[2]].value;var bw=sim.ep.signals[s_expr[3]].value;var clk=get_value(sim.ep.states[s_expr[5]].value);var bw_type="word";if(0==(bw&12))bw_type="byte";else if(1==(bw&12))bw_type="half";var value=0;if(typeof sim.ep.internal_states.MP[address]!="undefined")value=sim.ep.internal_states.MP[address];var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){verbal="Try to write a "+bw_type+" to memory "+"at address 0x"+address.toString(16)+" with value "+value.toString(16)+". "}verbal="Memory[0x"+address.toString(16)+"] = "+"0x"+value.toString(16)+" (Write a "+bw_type+" to 0x"+address.toString(16)+"). ";return verbal}};sim.ep.behaviors.MEMORY_RESET={nparameters:1,operation:function(s_expr){sim.ep.events.mem={}},verbal:function(s_expr){return"Reset main memory (all values will be zeroes). "}};sim.ep.components.IO={name:"IO",version:"1",abilities:["IO_TIMER"],details_name:["IO_STATS","IO_CONFIG"],details_fire:[["svg_p:text3775"],[]],write_state:function(vec){return vec},read_state:function(o,check){return false},get_state:function(reg){return null},get_value:function(elto){var associated_state=simhw_internalState_get("io_hash",elto);var value=get_value(simhw_sim_state(associated_state))>>>0;set_value(simhw_sim_state("BUS_AB"),elto);set_value(simhw_sim_signal("IOR"),1);compute_behavior("FIRE IOR");value=get_value(simhw_sim_state("BUS_DB"));return value},set_value:function(elto,value){var associated_state=simhw_internalState_get("io_hash",elto);set_value(simhw_sim_state(associated_state),value);set_value(simhw_sim_state("BUS_AB"),elto);set_value(simhw_sim_state("BUS_DB"),value);set_value(simhw_sim_signal("IOW"),1);compute_behavior("FIRE IOW");return value}};sim.ep.internal_states.io_int_factory=[];sim.ep.internal_states.io_int_factory[0]={period:0,probability:.5,accumulated:0,active:false};sim.ep.internal_states.io_int_factory[1]={period:0,probability:.5,accumulated:0,active:false};sim.ep.internal_states.io_int_factory[2]={period:0,probability:.5,accumulated:0,active:false};sim.ep.internal_states.io_int_factory[3]={period:0,probability:.5,accumulated:0,active:false};sim.ep.internal_states.io_int_factory[4]={period:0,probability:.5,accumulated:0,active:false};sim.ep.internal_states.io_int_factory[5]={period:0,probability:.5,accumulated:0,active:false};sim.ep.internal_states.io_int_factory[6]={period:0,probability:.5,accumulated:0,active:false};sim.ep.internal_states.io_int_factory[7]={period:0,probability:.5,accumulated:0,active:false};var IOSR_ID=4352;var IOCR_ID=4356;var IODR_ID=4360;sim.ep.internal_states.io_hash[IOSR_ID]="IOSR";sim.ep.internal_states.io_hash[IOCR_ID]="IOCR";sim.ep.internal_states.io_hash[IODR_ID]="IODR";sim.ep.states.IOSR={name:"IOSR",verbal:"IO State Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.IOCR={name:"IOCR",verbal:"IO Control Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.IODR={name:"IODR",verbal:"IO Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.signals.INT={name:"INT",visible:true,type:"L",value:0,default_value:0,nbits:"1",depends_on:["CLK"],behavior:["FIRE C","FIRE C"],fire_name:["svg_p:tspan4199"],draw_data:[[],["svg_p:path3809"]],draw_name:[[],[]]};sim.ep.signals.IORDY={name:"IORDY",visible:true,type:"L",value:0,default_value:0,nbits:"1",depends_on:["CLK"],behavior:["FIRE_IFCHANGED IORDY C","FIRE_IFCHANGED IORDY C"],fire_name:["svg_p:tspan4089","svg_p:path3793","svg_p:text3911"],draw_data:[[],["svg_p:path3897"]],draw_name:[[],[]]};sim.ep.signals.IO_IOR={name:"IO_IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","IO_IOR BUS_AB BUS_DB IOSR IOCR IODR CLK; FIRE SBWA"],fire_name:["svg_p:tspan4173"],draw_data:[[],["svg_p:path3795","svg_p:path3733"]],draw_name:[[],[]]};sim.ep.signals.IO_IOW={name:"IO_IOW",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","IO_IOW BUS_AB BUS_DB IOSR IOCR IODR CLK; FIRE SBWA"],fire_name:["svg_p:text3785-0-6-0-5-5"],draw_data:[[],["svg_p:path3805","svg_p:path3733"]],draw_name:[[],[]]};sim.ep.signals.IO_IE={name:"IO_IE",visible:true,type:"L",value:1,default_value:1,nbits:"1",behavior:["NOP","IO_CHK_I CLK INT INTV; FIRE C"],fire_name:[],draw_data:[[],[]],draw_name:[[],[]]};sim.ep.signals.INTA={name:"INTA",visible:true,type:"L",value:1,default_value:0,nbits:"1",behavior:["NOP","INTA CLK INT INTA BUS_DB INTV; FIRE BW; FIRE C"],fire_name:["svg_p:text3785-0-6-0-5-5-1-1"],draw_data:[[],["svg_p:path3807","svg_p:path3737"]],draw_name:[[],[]]};sim.ep.behaviors.IO_IOR={nparameters:7,types:["E","E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.ep.states[s_expr[1]]);var iosr=get_value(sim.ep.states[s_expr[3]]);var iocr=get_value(sim.ep.states[s_expr[4]]);var iodr=get_value(sim.ep.states[s_expr[5]]);if(bus_ab==IOSR_ID)set_value(sim.ep.states[s_expr[2]],iosr);if(bus_ab==IOCR_ID)set_value(sim.ep.states[s_expr[2]],iocr);if(bus_ab==IODR_ID)set_value(sim.ep.states[s_expr[2]],iodr)},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.ep.states[s_expr[1]]);var iosr=get_value(sim.ep.states[s_expr[3]]);var iocr=get_value(sim.ep.states[s_expr[4]]);var iodr=get_value(sim.ep.states[s_expr[5]]);if(bus_ab==IOSR_ID)verbal="I/O device read at IOSR of value "+iosr+". ";if(bus_ab==IOCR_ID)verbal="I/O device read at IOCR of value "+iocr+". ";if(bus_ab==IODR_ID)verbal="I/O device read at IODR of value "+iodr+". ";return verbal}};sim.ep.behaviors.IO_IOW={nparameters:7,types:["E","E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.ep.states[s_expr[1]]);var bus_db=get_value(sim.ep.states[s_expr[2]]);if(bus_ab!=IOSR_ID&&bus_ab!=IOCR_ID&&bus_ab!=IODR_ID){return}if(bus_ab==IOSR_ID)set_value(sim.ep.states[s_expr[3]],bus_db);if(bus_ab==IOCR_ID)set_value(sim.ep.states[s_expr[4]],bus_db);if(bus_ab==IODR_ID)set_value(sim.ep.states[s_expr[5]],bus_db);var iocr_id=get_value(sim.ep.states[s_expr[4]]);var iodr_id=get_value(sim.ep.states[s_expr[5]]);if(iocr_id<0||iocr_id>7)return;set_var(sim.ep.internal_states.io_int_factory[iocr_id].period,iodr_id);set_var(sim.ep.internal_states.io_int_factory[iocr_id].probability,1);if(0==iodr_id)set_var(sim.ep.internal_states.io_int_factory[iocr_id].probability,0)},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.ep.states[s_expr[1]]);var bus_db=get_value(sim.ep.states[s_expr[2]]);if(bus_ab==IOSR_ID)verbal="I/O device write at IOSR with value "+bus_db+". ";if(bus_ab==IOCR_ID)verbal="I/O device write at IOCR with value "+bus_db+". ";if(bus_ab==IODR_ID)verbal="I/O device write at IODR with value "+bus_db+". ";return verbal}};sim.ep.behaviors.IO_CHK_I={nparameters:4,types:["E","S","E"],operation:function(s_expr){var clk=get_value(sim.ep.states[s_expr[1]]);for(var i=sim.ep.internal_states.io_int_factory.length-1;i>=0;i--){if(get_var(sim.ep.internal_states.io_int_factory[i].period)==0)continue;if(get_var(sim.ep.internal_states.io_int_factory[i].active)==true){set_value(sim.ep.signals[s_expr[2]],1);set_value(sim.ep.states[s_expr[3]],i)}if(clk%get_var(sim.ep.internal_states.io_int_factory[i].period)==0){if(Math.random()>get_var(sim.ep.internal_states.io_int_factory[i].probability))continue;set_var(sim.ep.internal_states.io_int_factory[i].accumulated,get_var(sim.ep.internal_states.io_int_factory[i].accumulated)+1);set_var(sim.ep.internal_states.io_int_factory[i].active,true);if(typeof sim.ep.events.io[clk]=="undefined")sim.ep.events.io[clk]=[];sim.ep.events.io[clk].push(i);set_value(sim.ep.signals[s_expr[2]],1);set_value(sim.ep.states[s_expr[3]],i)}}},verbal:function(s_expr){return"Check I/O Interruption. "}};sim.ep.behaviors.INTA={nparameters:6,types:["E","S","S","E","E"],operation:function(s_expr){var clk=get_value(sim.ep.states[s_expr[1]]);if(typeof sim.ep.events.io[clk]!="undefined"){set_value(sim.ep.states[s_expr[4]],sim.ep.events.io[clk][0]);return}set_value(sim.ep.signals[s_expr[2]],0);set_value(sim.ep.states[s_expr[5]],0);for(var i=0;i<sim.ep.internal_states.io_int_factory.length;i++){if(get_var(sim.ep.internal_states.io_int_factory[i].active)){set_value(sim.ep.signals[s_expr[2]],0);set_value(sim.ep.states[s_expr[5]],i);set_value(sim.ep.states[s_expr[4]],i);if(typeof sim.ep.events.io[clk]=="undefined")sim.ep.events.io[clk]=[];sim.ep.events.io[clk].push(i);set_var(sim.ep.internal_states.io_int_factory[i].active,false);break}}},verbal:function(s_expr){return"Signal an interruption ACK. "}};sim.ep.behaviors.IO_RESET={nparameters:1,operation:function(s_expr){sim.ep.events.io={};for(var i=0;i<sim.ep.internal_states.io_int_factory.length;i++){set_var(sim.ep.internal_states.io_int_factory[i].accumulated,0);set_var(sim.ep.internal_states.io_int_factory[i].active,false)}},verbal:function(s_expr){return"Reset the I/O device. "}};sim.ep.components.KBD={name:"KBD",version:"1",abilities:["KEYBOARD"],details_name:["KEYBOARD"],details_fire:[["svg_p:text3829"]],write_state:function(vec){return vec},read_state:function(o,check){return false},get_state:function(reg){return null},get_value:function(elto){return sim.ep.internal_states.keyboard_content},set_value:function(elto,value){sim.ep.internal_states.keyboard_content=value;return value}};var KBDR_ID=256;var KBSR_ID=260;sim.ep.internal_states.io_hash[KBDR_ID]="KBDR";sim.ep.internal_states.io_hash[KBSR_ID]="KBSR";sim.ep.internal_states.keyboard_content="";sim.ep.states.KBDR={name:"KBDR",verbal:"Keyboard Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.KBSR={name:"KBSR",verbal:"Keyboard Status Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.signals.KBD_IOR={name:"KBD_IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","KBD_IOR BUS_AB BUS_DB KBDR KBSR CLK; FIRE SBWA"],fire_name:["svg_p:tspan4057"],draw_data:[[],["svg_p:path3863","svg_p:path3847"]],draw_name:[[],[]]};sim.ep.behaviors.KBD_IOR={nparameters:6,types:["E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.ep.states[s_expr[1]]);var clk=get_value(sim.ep.states[s_expr[5]]);if(bus_ab!=KBDR_ID&&bus_ab!=KBSR_ID){return}if(typeof sim.ep.events.keybd[clk]!="undefined"){if(bus_ab==KBDR_ID)set_value(sim.ep.states[s_expr[2]],sim.ep.events.keybd[clk]);if(bus_ab==KBSR_ID)set_value(sim.ep.states[s_expr[2]],1);return}if(get_value(sim.ep.states[s_expr[4]])==0){var keybuffer=get_keyboard_content();if(keybuffer.length!==0){var keybuffer_rest=keybuffer.substr(1,keybuffer.length-1);set_keyboard_content(keybuffer_rest);set_value(sim.ep.states[s_expr[4]],1);set_value(sim.ep.states[s_expr[3]],keybuffer[0].charCodeAt(0))}}if(get_value(sim.ep.states[s_expr[4]])==1){sim.ep.events.keybd[clk]=get_value(sim.ep.states[s_expr[3]])}if(bus_ab==KBSR_ID){set_value(sim.ep.states[s_expr[2]],get_value(sim.ep.states[s_expr[4]]))}if(bus_ab==KBDR_ID){if(get_value(sim.ep.states[s_expr[4]])==1)set_value(sim.ep.states[s_expr[2]],get_value(sim.ep.states[s_expr[3]]));set_value(sim.ep.states[s_expr[4]],0)}},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.ep.states[s_expr[1]]);var clk=get_value(sim.ep.states[s_expr[5]]);if(bus_ab==KBDR_ID)verbal="Read the screen data: "+sim.ep.states[s_expr[2]]+". ";if(bus_ab==KBSR_ID)verbal="Read the screen state: "+sim.ep.states[s_expr[2]]+". ";return verbal}};sim.ep.behaviors.KBD_RESET={nparameters:1,operation:function(s_expr){sim.ep.events.keybd={}},verbal:function(s_expr){return"Reset the keyboard content. "}};sim.ep.components.SCREEN={name:"SCREEN",version:"1",abilities:["SCREEN"],details_name:["SCREEN"],details_fire:[["svg_p:text3845"]],write_state:function(vec){if(typeof vec.SCREEN=="undefined"){vec.SCREEN={}}var sim_screen=sim.ep.internal_states.screen_content;var sim_lines=sim_screen.trim().split("\n");for(var i=0;i<sim_lines.length;i++){value=sim_lines[i];if(value!=""){vec.SCREEN[i]={type:"screen",default_value:"",id:i,op:"==",value:value}}}return vec},read_state:function(vec,check){if(typeof vec.SCREEN=="undefined"){vec.SCREEN={}}if("SCREEN"==check.type.toUpperCase().trim()){vec.SCREEN[check.id]={type:"screen",default_value:"",id:check.id,op:check.condition,value:check.value};return true}return false},get_state:function(line){var sim_screen=sim.ep.internal_states.screen_content;var sim_lines=sim_screen.trim().split("\n");var index=parseInt(line);if(typeof sim_lines[index]!="undefined")return sim_lines[index];return null},get_value:function(elto){return sim.ep.internal_states.screen_content},set_value:function(elto,value){sim.ep.internal_states.screen_content=value;return value}};var DDR_ID=4096;var DSR_ID=4100;sim.ep.internal_states.io_hash[DDR_ID]="DDR";sim.ep.internal_states.io_hash[DSR_ID]="DSR";sim.ep.internal_states.screen_content="";sim.ep.states.DDR={name:"DDR",verbal:"Display Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.DSR={name:"DSR",verbal:"Display State Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.signals.SCR_IOR={name:"SCR_IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","SCR_IOR BUS_AB BUS_DB DDR DSR CLK"],fire_name:["svg_p:tspan4004"],draw_data:[[],["svg_p:path3871","svg_p:path3857"]],draw_name:[[],[]]};sim.ep.signals.SCR_IOW={name:"SCR_IOW",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","SCR_IOW BUS_AB BUS_DB DDR DSR CLK"],fire_name:["svg_p:tspan4006"],draw_data:[[],["svg_p:path3873","svg_p:path3857"]],draw_name:[[],[]]};sim.ep.behaviors.SCR_IOR={nparameters:6,types:["E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.ep.states[s_expr[1]]);var ddr=get_value(sim.ep.states[s_expr[3]]);var dsr=get_value(sim.ep.states[s_expr[4]]);if(bus_ab==DDR_ID)set_value(sim.ep.states[s_expr[2]],ddr);if(bus_ab==DSR_ID)set_value(sim.ep.states[s_expr[2]],dsr)},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.ep.states[s_expr[1]]);var ddr=get_value(sim.ep.states[s_expr[3]]);var dsr=get_value(sim.ep.states[s_expr[4]]);if(bus_ab==DDR_ID)verbal="Try to read from the screen the DDR value "+ddr+". ";if(bus_ab==DDR_ID)verbal="Try to read into the screen the DSR value "+dsr+". ";return verbal}};sim.ep.behaviors.SCR_IOW={nparameters:6,types:["E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.ep.states[s_expr[1]]);var bus_db=get_value(sim.ep.states[s_expr[2]]);var clk=get_value(sim.ep.states[s_expr[5]]);var ch=String.fromCharCode(bus_db);if(bus_ab!=DDR_ID){return}if(ch==String.fromCharCode(7)){timbre.reset();var s1=T("sin",{freq:440,mul:.5});var s2=T("sin",{freq:660,mul:.5});T("perc",{r:500},s1,s2).on("ended",(function(){this.pause()})).bang().play()}else{var screen=get_screen_content();if(typeof sim.ep.events.screen[clk]!="undefined")screen=screen.substr(0,screen.length-1);set_screen_content(screen+String.fromCharCode(bus_db))}set_value(sim.ep.states[s_expr[3]],bus_db);set_value(sim.ep.states[s_expr[4]],1);sim.ep.events.screen[clk]=bus_db},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.ep.states[s_expr[1]]);var bus_db=get_value(sim.ep.states[s_expr[2]]);var clk=get_value(sim.ep.states[s_expr[5]]);var ch=String.fromCharCode(bus_db);if(bus_ab==DDR_ID)verbal="Try to write into the screen the code "+ch+" at clock cycle "+clk+". ";return verbal}};sim.ep.behaviors.SCREEN_RESET={nparameters:1,operation:function(s_expr){sim.ep.events.screen={}},verbal:function(s_expr){return"Reset the screen content. "}};sim.ep.components.L3D={name:"L3D",version:"1",abilities:["3DLED"],details_name:["3DLED"],details_fire:[[]],write_state:function(vec){return vec},read_state:function(o,check){return false},get_state:function(reg){return null},get_value:function(elto){var associated_state=simhw_internalState_get("io_hash",elto);var value=get_value(simhw_sim_state(associated_state))>>>0;set_value(simhw_sim_state("BUS_AB"),elto);set_value(simhw_sim_signal("IOR"),1);compute_behavior("FIRE IOR");value=get_value(simhw_sim_state("BUS_DB"));return value},set_value:function(elto,value){var associated_state=simhw_internalState_get("io_hash",elto);set_value(simhw_sim_state(associated_state),value);set_value(simhw_sim_state("BUS_AB"),elto);set_value(simhw_sim_state("BUS_DB"),value);set_value(simhw_sim_signal("IOW"),1);compute_behavior("FIRE IOW");return value}};sim.ep.internal_states.l3d_dim=4;sim.ep.internal_states.l3d_neltos=Math.pow(sim.ep.internal_states.l3d_dim,3);sim.ep.internal_states.l3d_state=Array.from({length:sim.ep.internal_states.l3d_neltos},()=>({active:false}));sim.ep.internal_states.l3d_frame="0".repeat(sim.ep.internal_states.l3d_neltos);var L3DSR_ID=8448;var L3DCR_ID=8452;var L3DDR_ID=8456;sim.ep.internal_states.io_hash[L3DSR_ID]="L3DSR";sim.ep.internal_states.io_hash[L3DCR_ID]="L3DCR";sim.ep.internal_states.io_hash[L3DDR_ID]="L3DDR";sim.ep.states.L3DSR={name:"L3DSR",verbal:"L3D State Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.L3DCR={name:"L3DCR",verbal:"L3D Control Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.states.L3DDR={name:"L3DDR",verbal:"L3D Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.ep.signals.L3D_IOR={name:"L3D_IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","L3D_IOR BUS_AB BUS_DB L3DSR L3DCR L3DDR CLK; FIRE SBWA"],fire_name:["svg_p:tspan4173"],draw_data:[[],["svg_p:path3795","svg_p:path3733"]],draw_name:[[],[]]};sim.ep.signals.L3D_IOW={name:"L3D_IOW",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","L3D_IOW BUS_AB BUS_DB L3DSR L3DCR L3DDR CLK; FIRE SBWA; L3D_SYNC"],fire_name:["svg_p:text3785-0-6-0-5-5"],draw_data:[[],["svg_p:path3805","svg_p:path3733"]],draw_name:[[],[]]};sim.ep.behaviors.L3D_IOR={nparameters:7,types:["E","E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.ep.states[s_expr[1]]);var iosr=get_value(sim.ep.states[s_expr[3]]);var iocr=get_value(sim.ep.states[s_expr[4]]);var iodr=get_value(sim.ep.states[s_expr[5]]);if(bus_ab==L3DCR_ID){set_value(sim.ep.states[s_expr[2]],iocr)}if(bus_ab==L3DDR_ID){set_value(sim.ep.states[s_expr[2]],iodr)}if(bus_ab==L3DSR_ID){var x=(iodr&4278190080)>>24;var y=(iodr&16711680)>>16;var z=(iodr&65280)>>8;var p=z*Math.pow(sim.ep.internal_states.l3d_dim,2)+y*sim.ep.internal_states.l3d_dim+x;var s=get_var(sim.ep.internal_states.l3d_state[p].active);set_value(sim.ep.states[s_expr[2]],s)}},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.ep.states[s_expr[1]]);var iosr=get_value(sim.ep.states[s_expr[3]]);var iocr=get_value(sim.ep.states[s_expr[4]]);var iodr=get_value(sim.ep.states[s_expr[5]]);if(bus_ab==L3DSR_ID)verbal="I/O device read at L3DSR of value "+iosr+". ";if(bus_ab==L3DCR_ID)verbal="I/O device read at L3DCR of value "+iocr+". ";if(bus_ab==L3DDR_ID)verbal="I/O device read at L3DDR of value "+iodr+". ";return verbal}};sim.ep.behaviors.L3D_IOW={nparameters:7,types:["E","E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.ep.states[s_expr[1]]);var bus_db=get_value(sim.ep.states[s_expr[2]]);if(bus_ab!=L3DSR_ID&&bus_ab!=L3DCR_ID&&bus_ab!=L3DDR_ID){return}if(bus_ab==L3DSR_ID){set_value(sim.ep.states[s_expr[3]],bus_db)}if(bus_ab==L3DDR_ID){set_value(sim.ep.states[s_expr[5]],bus_db)}if(bus_ab==L3DCR_ID){set_value(sim.ep.states[s_expr[4]],bus_db);var x=(bus_db&4278190080)>>24;var y=(bus_db&16711680)>>16;var z=(bus_db&65280)>>8;var p=z*Math.pow(sim.ep.internal_states.l3d_dim,2)+y*sim.ep.internal_states.l3d_dim+x;var s=(bus_db&255)!=0;set_var(sim.ep.internal_states.l3d_state[p].active,s)}},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.ep.states[s_expr[1]]);var bus_db=get_value(sim.ep.states[s_expr[2]]);if(bus_ab==L3DSR_ID)verbal="I/O device write at L3DSR with value "+bus_db+". ";if(bus_ab==L3DCR_ID)verbal="I/O device write at L3DCR with value "+bus_db+". ";if(bus_ab==L3DDR_ID)verbal="I/O device write at L3DDR with value "+bus_db+". ";return verbal}};sim.ep.behaviors.L3D_RESET={nparameters:1,operation:function(s_expr){sim.ep.events.l3d={};for(var i=0;i<sim.ep.internal_states.l3d_state.length;i++){set_var(sim.ep.internal_states.l3d_state[i].active,false)}var o="0".repeat(64);sim.ep.internal_states.l3d_frame=o;simcore_rest_call("L3D","POST","/",{frame:o})},verbal:function(s_expr){return"Reset the I/O device. "}};sim.ep.behaviors.L3D_SYNC={nparameters:1,operation:function(s_expr){var l3dstates=sim.ep.internal_states.l3d_state;var o="";var p=0;for(var i=0;i<4;i++){for(var j=0;j<4;j++){for(var k=0;k<4;k++){p=k*Math.pow(sim.ep.internal_states.l3d_dim,2)+j*sim.ep.internal_states.l3d_dim+i;if(get_var(l3dstates[p].active))o=o+"1";else o=o+"0"}}}if(sim.ep.internal_states.l3d_frame!=o){sim.ep.internal_states.l3d_frame=o;simcore_rest_call("L3D","POST","/",{frame:o})}},verbal:function(s_expr){return"Sync State with Device. "}};var poc_def={sim_name:"Proof-Of-Concept Processor",sim_short_name:"poc",sim_img_processor:"examples/hardware/poc/images/processor.svg",sim_img_controlunit:"examples/hardware/poc/images/controlunit.svg",sim_img_cpu:"examples/hardware/poc/images/cpu.svg",components:{},states:{},signals:{},behaviors:{},events:{},internal_states:{},ctrl_states:{}};simhw_add(poc_def);sim.poc.behaviors.PRINT_S={nparameters:2,types:["S"],operation:function(s_expr){console.log(s_expr[1]+": 0x"+sim.poc.signals[s_expr[1]].value.toString(16))},verbal:function(s_expr){return"Print value of signal "+s_expr[1]+": 0x"+sim.poc.signals[s_expr[1]].value.toString(16)+". "}};sim.poc.behaviors.PRINT_E={nparameters:2,types:["E"],operation:function(s_expr){console.log(s_expr[1]+": 0x"+sim.poc.states[s_expr[1]].value.toString(16))},verbal:function(s_expr){return"Print value of state "+s_expr[1]+": 0x"+sim.poc.states[s_expr[1]].value.toString(16)+". "}};sim.poc.components["CPU"]={name:"CPU",version:"1",abilities:["CPU"],details_name:["REGISTER_FILE","CONTROL_MEMORY","CLOCK","CPU_STATS"],details_fire:[["svg_p:text3495","svg_p:text3029","svg_p:text3031"],["svg_cu:text3010"],["svg_p:text3459-7","svg_cu:text4138","svg_cu:text4138-7","svg_cu:tspan4140-2"],["svg_p:text3495"]],write_state:function(vec){if(typeof vec.CPU=="undefined")vec.CPU={};var internal_reg=["PC","SR"];var value=0;for(var i=0;i<sim.poc.states.BR.length;i++){value=parseInt(sim.poc.states.BR[i].value);if(value!=0){vec.CPU["R"+i]={type:"register",default_value:0,id:"R"+i,op:"=",value:"0x"+value.toString(16)}}}for(var i=0;i<internal_reg.length;i++){value=parseInt(sim.poc.states["REG_"+internal_reg[i]].value);if(value!=0){vec.CPU[internal_reg[i]]={type:"register",default_value:0,id:internal_reg[i],op:"=",value:"0x"+value.toString(16)}}}return vec},read_state:function(vec,check){if(typeof vec.CPU=="undefined")vec.CPU={};var key=check["id"].toUpperCase().trim();var val=parseInt(check["value"]).toString(16);if("REGISTER"==check["type"].toUpperCase().trim()){vec.CPU[key]={type:"register",default_value:0,id:key,op:check["condition"],value:"0x"+val};return true}return false},get_state:function(reg){var r_reg=reg.toUpperCase().trim();if(typeof sim.poc.states["REG_"+r_reg]!="undefined"){return"0x"+get_value(sim.poc.states["REG_"+r_reg]).toString(16)}r_reg=r_reg.replace("R","");var index=parseInt(r_reg);if(typeof sim.poc.states.BR[index]!="undefined"){return"0x"+get_value(sim.poc.states.BR[index]).toString(16)}return null},get_value:function(elto){if(Number.isInteger(elto))index=elto;else index=parseInt(elto);if(isNaN(index))return get_value(simhw_sim_state(elto))>>>0;return get_value(simhw_sim_states().BR[index])>>>0},set_value:function(elto,value){var pc_name=simhw_sim_ctrlStates_get().pc.state;if(Number.isInteger(elto))index=elto;else index=parseInt(elto);if(isNaN(index)){set_value(simhw_sim_state(elto),value);if(pc_name===elto){show_asmdbg_pc()}return value}return set_value(simhw_sim_states().BR[index],value)}};sim.poc.ctrl_states.pc={name:"PC",state:"REG_PC"};sim.poc.ctrl_states.sp={name:"SP",state:"BR.29"};sim.poc.ctrl_states.ir={name:"IR",state:"REG_IR",default_eltos:{co:{begin:0,end:5,length:6},cop:{begin:27,end:31,length:5}}};sim.poc.ctrl_states.mpc={name:"mPC",state:"REG_MICROADDR"};sim.poc.internal_states.MC={};sim.poc.internal_states.MC_dashboard={};sim.poc.internal_states.ROM={};sim.poc.internal_states.FIRMWARE={};sim.poc.internal_states.io_hash={};sim.poc.internal_states.fire_stack=[];sim.poc.internal_states.tri_state_names=["T1","T2","T3","T6","T8","T9","T10","T11"];sim.poc.internal_states.fire_visible={databus:false,internalbus:false};sim.poc.internal_states.filter_states=["REG_IR_DECO,col-11","REG_IR,col-auto","REG_PC,col-auto","REG_SR,col-auto","REG_RT1,col-auto","REG_MAR,col-auto","REG_MBR,col-auto","REG_MICROADDR,col-auto"];sim.poc.internal_states.filter_signals=["A0,0","B,0","C,0","SELA,5","SELB,5","SELC,2","SELCOP,0","MR,0","MC,0","C0,0","C1,0","C2,0","C3,0","C4,0","C7,0","T1,0","T2,0","T3,0","T6,0","T8,0","T9,0","T10,0","T11,0","M1,0","M7,0","MA,0","MB,0","LC,0","SE,0","SIZE,0","OFFSET,0","BW,0","R,0","W,0","TA,0","TD,0","IOR,0","IOW,0","TEST_I,0","TEST_U,0"];sim.poc.internal_states.alu_flags={flag_n:0,flag_z:0,flag_v:0,flag_c:0};sim.poc.states.BR=[];sim.poc.states.BR[0]={name:"R0",verbal:"Register  0",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[1]={name:"R1",verbal:"Register  1",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[2]={name:"R2",verbal:"Register  2",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[3]={name:"R3",verbal:"Register  3",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[4]={name:"R4",verbal:"Register  4",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[5]={name:"R5",verbal:"Register  5",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[6]={name:"R6",verbal:"Register  6",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[7]={name:"R7",verbal:"Register  7",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[8]={name:"R8",verbal:"Register  8",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[9]={name:"R9",verbal:"Register  9",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[10]={name:"R10",verbal:"Register 10",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[11]={name:"R11",verbal:"Register 11",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[12]={name:"R12",verbal:"Register 12",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[13]={name:"R13",verbal:"Register 13",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[14]={name:"R14",verbal:"Register 14",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[15]={name:"R15",verbal:"Register 15",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[16]={name:"R16",verbal:"Register 16",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[17]={name:"R17",verbal:"Register 17",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[18]={name:"R18",verbal:"Register 18",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[19]={name:"R19",verbal:"Register 19",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[20]={name:"R20",verbal:"Register 20",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[21]={name:"R21",verbal:"Register 21",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[22]={name:"R22",verbal:"Register 22",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[23]={name:"R23",verbal:"Register 23",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[24]={name:"R24",verbal:"Register 24",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[25]={name:"R25",verbal:"Register 25",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[26]={name:"R26",verbal:"Register 26",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[27]={name:"R27",verbal:"Register 27",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[28]={name:"R28",verbal:"Register 28",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[29]={name:"R29",verbal:"Register 29",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[30]={name:"R30",verbal:"Register 30",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[31]={name:"R31",verbal:"Register 31",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[32]={name:"R32",verbal:"Register 32",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[33]={name:"R33",verbal:"Register 33",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[34]={name:"R34",verbal:"Register 34",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[35]={name:"R35",verbal:"Register 35",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[36]={name:"R36",verbal:"Register 36",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[37]={name:"R37",verbal:"Register 37",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[38]={name:"R38",verbal:"Register 38",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[39]={name:"R39",verbal:"Register 39",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[40]={name:"R40",verbal:"Register 40",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[41]={name:"R41",verbal:"Register 41",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[42]={name:"R42",verbal:"Register 42",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[43]={name:"R43",verbal:"Register 43",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[44]={name:"R44",verbal:"Register 44",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[45]={name:"R45",verbal:"Register 45",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[46]={name:"R46",verbal:"Register 46",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[47]={name:"R47",verbal:"Register 47",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[48]={name:"R48",verbal:"Register 48",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[49]={name:"R49",verbal:"Register 49",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[50]={name:"R50",verbal:"Register 50",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[51]={name:"R51",verbal:"Register 51",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[52]={name:"R52",verbal:"Register 52",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[53]={name:"R53",verbal:"Register 53",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[54]={name:"R54",verbal:"Register 54",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[55]={name:"R55",verbal:"Register 55",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[56]={name:"R56",verbal:"Register 56",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[57]={name:"R57",verbal:"Register 57",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[58]={name:"R58",verbal:"Register 58",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[59]={name:"R59",verbal:"Register 59",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[60]={name:"R60",verbal:"Register 60",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[61]={name:"R61",verbal:"Register 61",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[62]={name:"R62",verbal:"Register 62",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.BR[63]={name:"R63",verbal:"Register 63",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["REG_PC"]={name:"PC",verbal:"Program Counter Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["REG_MAR"]={name:"MAR",verbal:"Memory Address Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["REG_MBR"]={name:"MBR",verbal:"Memory Data Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["REG_IR"]={name:"IR",verbal:"Instruction Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["REG_SR"]={name:"SR",verbal:"State Register",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["REG_RT1"]={name:"RT1",verbal:"Temporal Register 1",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["BUS_IB"]={name:"I_BUS",verbal:"Internal Bus",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["BUS_AB"]={name:"A_BUS",verbal:"Address Bus",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["BUS_CB"]={name:"C_BUS",verbal:"Control Bus",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["BUS_DB"]={name:"D_BUS",verbal:"Data Bus",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["RA_T9"]={name:"RA_T9",verbal:"Input of T9 Tristate",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["RB_T10"]={name:"RB_T10",verbal:"Input of T10 Tristate",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["SELEC_T3"]={name:"SELEC_T3",verbal:"Input of T3 Tristate",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["ALU_T6"]={name:"ALU_T6",verbal:"Input of T6 Tristate",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["MA_ALU"]={name:"MA_ALU",verbal:"Input ALU via MA",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["MB_ALU"]={name:"MB_ALU",verbal:"Input ALU via MB",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["FLAG_C"]={name:"FLAG_C",verbal:"Carry Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.poc.states["FLAG_V"]={name:"FLAG_V",verbal:"Overflow Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.poc.states["FLAG_N"]={name:"FLAG_N",verbal:"Negative Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.poc.states["FLAG_Z"]={name:"FLAG_Z",verbal:"Zero Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.poc.states["FLAG_I"]={name:"FLAG_I",verbal:"Interruption Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.poc.states["FLAG_U"]={name:"FLAG_U",verbal:"User Flag",visible:true,nbits:"1",value:0,default_value:0,draw_data:[]};sim.poc.states["REG_MICROADDR"]={name:"µADDR",verbal:"Microaddress Register",visible:true,nbits:"12",value:0,default_value:0,draw_data:["svg_cu:text4667"]};sim.poc.states["REG_MICROINS"]={name:"µINS",verbal:"Microinstruction Register",visible:true,nbits:"77",value:{},default_value:{},draw_data:[]};sim.poc.states["FETCH"]={name:"FETCH",verbal:"Input Fetch",visible:false,nbits:"12",value:0,default_value:0,draw_data:[]};sim.poc.states["ROM_MUXA"]={name:"ROM_MUXA",verbal:"Input ROM",visible:false,nbits:"12",value:0,default_value:0,draw_data:[]};sim.poc.states["SUM_ONE"]={name:"SUM_ONE",verbal:"Input next microinstruction",visible:false,nbits:"12",value:1,default_value:1,draw_data:[]};sim.poc.states["MUXA_MICROADDR"]={name:"MUXA_MICROADDR",verbal:"Input microaddress",visible:false,nbits:"12",value:0,default_value:0,draw_data:[]};sim.poc.states["MUXC_MUXB"]={name:"MUXC_MUXB",verbal:"Output of MUX C",visible:false,nbits:"1",value:0,default_value:0,draw_data:[]};sim.poc.states["INEX"]={name:"INEX",verbal:"Illegal Instruction Exception",visible:false,nbits:"1",value:0,default_value:0,draw_data:[]};sim.poc.states["BS_M1"]={name:"BS_M1",verbal:"from Memory",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["BS_TD"]={name:"BS_TD",verbal:"Memory",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["INTV"]={name:"INTV",verbal:"Interruption Vector",visible:false,nbits:"8",value:0,default_value:0,draw_data:[]};sim.poc.states["M1_C1"]={name:"M1_C1",verbal:"Input of Memory Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["M7_C7"]={name:"M7_C7",verbal:"Input of State Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["VAL_ZERO"]={name:"VAL_ZERO",verbal:"Wired Zero",visible:false,nbits:"1",value:0,default_value:0,draw_data:[]};sim.poc.states["VAL_ONE"]={name:"VAL_ONE",verbal:"Wired One",visible:false,nbits:"32",value:1,default_value:1,draw_data:[]};sim.poc.states["VAL_FOUR"]={name:"VAL_FOUR",verbal:"Wired Four",visible:false,nbits:"32",value:4,default_value:4,draw_data:[]};sim.poc.states["REG_IR_DECO"]={name:"IR_DECO",verbal:"Instruction Decoded",visible:true,nbits:"0",value:0,default_value:0,draw_data:[]};sim.poc.states["DECO_INS"]={name:"DECO_INS",verbal:"Instruction decoded in binary",visible:true,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states["CLK"]={name:"CLK",verbal:"Clock",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.signals["C"]={name:"C",visible:true,type:"L",value:0,default_value:0,nbits:"4",behavior:["MV MUXC_MUXB VAL_ZERO; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MBIT MUXC_MUXB INT 0 1; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MBIT MUXC_MUXB IORDY 0 1; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MBIT MUXC_MUXB MRDY 0 1; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MBIT MUXC_MUXB REG_SR 0 1; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MBIT MUXC_MUXB REG_SR 1 1; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MBIT MUXC_MUXB REG_SR 28 1; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MBIT MUXC_MUXB REG_SR 29 1; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MBIT MUXC_MUXB REG_SR 30 1; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MBIT MUXC_MUXB REG_SR 31 1; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB","MV MUXC_MUXB INEX; FIRE_IFCHANGED B MUXC_MUXB; RESET_CHANGED MUXC_MUXB"],fire_name:["svg_cu:text3410"],draw_data:[["svg_cu:path3108"],["svg_cu:path3062"],["svg_cu:path3060"],["svg_cu:path3136"],["svg_cu:path3482"],["svg_cu:path3480"],["svg_cu:path3488"],["svg_cu:path3486"],["svg_cu:path3484"],["svg_cu:path3484-9"],["svg_cu:path3108-3","svg_cu:path3260-3-8-6","svg_cu:path3260-3-8","svg_cu:path3260-3"]],draw_name:[["svg_cu:path3496","svg_cu:path3414","svg_cu:path3194-08"]]};sim.poc.signals["B"]={name:"B",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV A1 MUXC_MUXB; FIRE A1","NOT_ES A1 MUXC_MUXB; FIRE A1"],depends_on:["CLK"],fire_name:["svg_cu:text3408"],draw_data:[["svg_cu:path3094-7"],["svg_cu:path3392","svg_cu:path3372","svg_cu:path3390","svg_cu:path3384","svg_cu:path3108-1","svg_cu:path3100-8-7"]],draw_name:[[],["svg_cu:path3194-0","svg_cu:path3138-8","svg_cu:path3498-6"]]};sim.poc.signals["A0"]={name:"A0",visible:false,type:"L",value:0,default_value:0,nbits:"1",behavior:["SBIT_SIGNAL A0A1 0 1; FIRE A0A1","SBIT_SIGNAL A0A1 1 1; FIRE A0A1"],depends_on:["CLK"],fire_name:["svg_cu:text3406"],draw_data:[["svg_cu:path3096"],["svg_cu:path3096"]],draw_name:[[],["svg_cu:path3138-8-1","svg_cu:path3098-2","svg_cu:path3124-2-5"]]};sim.poc.signals["A1"]={name:"A1",visible:false,type:"L",value:0,default_value:0,nbits:"1",behavior:["SBIT_SIGNAL A0A1 0 0; FIRE A0A1","SBIT_SIGNAL A0A1 1 0; FIRE A0A1"],depends_on:["CLK"],fire_name:[],draw_data:[["svg_cu:path3094"],["svg_cu:path3094"]],draw_name:[[]]};sim.poc.signals["A0A1"]={name:"A0A1",visible:true,type:"L",value:0,default_value:0,nbits:"2",behavior:["PLUS1 MUXA_MICROADDR REG_MICROADDR","CP_FIELD MUXA_MICROADDR REG_MICROINS/MADDR","MV MUXA_MICROADDR ROM_MUXA","MV MUXA_MICROADDR FETCH"],depends_on:["CLK"],fire_name:[],draw_data:[["svg_cu:path3102","svg_cu:path3100","svg_cu:path3098","svg_cu:path3100-9","svg_cu:path3088"],["svg_cu:path3104","svg_cu:path3134","svg_cu:path3500","svg_cu:path3416"],["svg_cu:path3504","svg_cu:path3100-8","svg_cu:path3234-9"],["svg_cu:path3124"]],draw_name:[[]]};sim.poc.signals["C0"]={name:"C0",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","MV REG_MAR BUS_IB"],fire_name:["svg_p:text3077"],draw_data:[["svg_p:path3081"]],draw_name:[["svg_p:path3075"]]};sim.poc.signals["C1"]={name:"C1",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","MV REG_MBR M1_C1"],fire_name:["svg_p:text3079"],draw_data:[["svg_p:path3055"]],draw_name:[["svg_p:path3073"]]};sim.poc.signals["C2"]={name:"C2",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","MV REG_PC BUS_IB; UPDATEDPC"],fire_name:["svg_p:text3179"],draw_data:[["svg_p:path3217"]],draw_name:[["svg_p:path3177"]]};sim.poc.signals["C3"]={name:"C3",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","MV REG_IR BUS_IB; DECO; FIRE_IFSET C 10"],fire_name:["svg_p:text3439"],draw_data:[["svg_p:path3339","svg_p:path3913-4"]],draw_name:[["svg_p:path3337"]]};sim.poc.signals["C4"]={name:"C4",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","MV REG_RT1 BUS_IB"],fire_name:["svg_p:tspan482"],draw_data:[["svg_p:path3339-4"]],draw_name:[["svg_p:path3337-0"]]};sim.poc.signals["C7"]={name:"C7",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","MV REG_SR M7_C7; FIRE C"],fire_name:["svg_p:text3655"],draw_data:[["svg_p:path3651-9"]],draw_name:[["svg_p:path3681"]]};sim.poc.signals["TA"]={name:"TA",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_AB REG_MAR"],fire_name:["svg_p:text3091"],draw_data:[["svg_p:path3089","svg_p:path3597","svg_p:path3513","svg_p:path3601","svg_p:path3601-2","svg_p:path3187","svg_p:path3087","svg_p:path2995","svg_p:path3535"]],draw_name:[["svg_p:path3085"]]};sim.poc.signals["TD"]={name:"TD",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_DB REG_MBR; FIRE R; FIRE W"],fire_name:["svg_p:text3103"],draw_data:[["svg_p:path3101","svg_p:path3587","svg_p:path3419-8","svg_p:path3071","svg_p:path3099","svg_p:path3097","svg_p:path3559-5","svg_p:path3419-1-0","svg_p:path3583","svg_p:path3419-1","svg_p:path3491","svg_p:path3641","svg_p:path3541"]],draw_name:[["svg_p:path3095"]]};sim.poc.signals["T1"]={name:"T1",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB REG_MBR; FIRE M7; FIRE M1"],fire_name:["svg_p:text3105"],draw_data:[["svg_p:path3071","svg_p:path3069","svg_p:path3049","svg_p:path3063-9","svg_p:path3071"]],draw_name:[["svg_p:path3067"]]};sim.poc.signals["T2"]={name:"T2",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB REG_PC; FIRE M7; FIRE M1"],fire_name:["svg_p:text3449"],draw_data:[["svg_p:path3199","svg_p:path3201","svg_p:path3049"]],draw_name:[["svg_p:path3329"]]};sim.poc.signals["T3"]={name:"T3",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB SELEC_T3; FIRE M7; FIRE M1"],fire_name:["svg_p:text3451"],draw_data:[["svg_p:path3349","svg_p:path3931","svg_p:path3345","svg_p:path3049"]],draw_name:[["svg_p:path3351"]]};sim.poc.signals["T6"]={name:"T6",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB ALU_T6; FIRE M7; FIRE M1"],fire_name:["svg_p:text3457"],draw_data:[["svg_p:path3589","svg_p:path3317","svg_p:path3163-2","svg_p:path3049","svg_p:path3317-9","svg_p:path3321","svg_p:path3261-8"]],draw_name:[["svg_p:path3319"]]};sim.poc.signals["T8"]={name:"T8",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB REG_SR; FIRE M7; FIRE M1"],fire_name:["svg_p:text3657"],draw_data:[["svg_p:path3651","svg_p:path3647","svg_p:path3049"]],draw_name:[["svg_p:path3649"]]};sim.poc.signals["T9"]={name:"T9",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB RA_T9; FIRE M7; FIRE M1"],fire_name:["svg_p:text3147"],draw_data:[["svg_p:path3143","svg_p:path3139","svg_p:path3049","svg_p:path3143-9"]],draw_name:[["svg_p:path3133"]]};sim.poc.signals["T10"]={name:"T10",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MV BUS_IB RB_T10; FIRE M7; FIRE M1"],fire_name:["svg_p:text3149"],draw_data:[["svg_p:path3145","svg_p:path3141","svg_p:path3049","svg_p:path3145-5"]],draw_name:[["svg_p:path3137"]]};sim.poc.signals["T11"]={name:"T11",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","CP_FIELD BUS_IB REG_MICROINS/EXCODE; FIRE M7; FIRE M1"],fire_name:["svg_p:text3147-5","svg_cu:tspan4426"],draw_data:[["svg_p:path3081-3","svg_p:path3139-7","svg_p:path3049","svg_cu:path3081-3","svg_cu:path3139-7","svg_cu:path3502"]],draw_name:[["svg_p:path3133-6","svg_cu:path3133-6"]]};sim.poc.signals["M1"]={name:"M1",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV M1_C1 BUS_IB","MV M1_C1 BUS_DB"],depends_on:["C1"],fire_name:["svg_p:text3469"],draw_data:[["svg_p:path3063","svg_p:path3061","svg_p:path3059"],["svg_p:path3057","svg_p:path3641","svg_p:path3419","svg_p:path3583"]],draw_name:[[],["svg_p:path3447"]]};sim.poc.signals["M7"]={name:"M7",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV M7_C7 BUS_IB","MV M7_C7 REG_SR; UPDATE_FLAG M7_C7 FLAG_C 31; UPDATE_FLAG M7_C7 FLAG_V 30; UPDATE_FLAG M7_C7 FLAG_N 29; UPDATE_FLAG M7_C7 FLAG_Z 28"],depends_on:["C7"],fire_name:["svg_p:text3673"],draw_data:[["svg_p:path3691","svg_p:path3693","svg_p:path3659"],["svg_p:path3695"]],draw_name:[[],["svg_p:path3667"]]};sim.poc.signals["MA"]={name:"MA",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV MA_ALU RA_T9; FIRE COP","MV MA_ALU BUS_IB; FIRE COP"],depends_on:["SELA","SELB"],fire_name:["svg_p:text3463"],draw_data:[["svg_p:path3249","svg_p:path3161","svg_p:path3165"],["svg_p:path3279"]],draw_name:[[],["svg_p:path3423"]]};sim.poc.signals["MB"]={name:"MB",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV MB_ALU RB_T10; FIRE COP","MV MB_ALU REG_PC; FIRE COP"],depends_on:["SELA","SELB"],fire_name:["svg_p:text3465"],draw_data:[["svg_p:path3281","svg_p:path3171","svg_p:path3169"],["svg_p:path3283"]],draw_name:[[],["svg_p:path3425","svg_p:path3427"]]};sim.poc.signals["COP"]={name:"COP",visible:true,type:"L",value:0,default_value:0,nbits:"5",forbidden:true,behavior:["NOP_ALU; UPDATE_NZVC","AND ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","OR ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","NOT ALU_T6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","XOR ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","SRL ALU_T6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","SRA ALU_T6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","SL ALU_T6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","RR ALU_T6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","RL ALU_T6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","ADD ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","SUB ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","MUL ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","DIV ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","MOD ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","LUI ALU_T6 MA_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","ADDFOUR ALU_T6 MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","ADDONE ALU_T6 MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","SUBFOUR ALU_T6 MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","SUBONE ALU_T6 MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","FADD ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","FSUB ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","FMUL ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","FDIV ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","FMOD ALU_T6 MA_ALU MB_ALU; UPDATE_NZVC; FIRE_IFSET T6 1; FIRE_IFSET M7 1","NOP_ALU","NOP_ALU","NOP_ALU","NOP_ALU","NOP_ALU","NOP_ALU","NOP_ALU"],depends_on:["SELCOP"],fire_name:["svg_p:text3303"],draw_data:[["svg_p:path3237","svg_p:path3239","svg_p:path3261-8","svg_p:path3321","svg_p:path3901-6","svg_p:path3317-9"]],draw_name:[["svg_p:path3009","svg_p:path3301"]]};sim.poc.signals["SELA"]={name:"SELA",visible:true,type:"L",value:0,default_value:0,nbits:"6",behavior:["FIRE_IFCHANGED MRA SELA; RESET_CHANGED SELA"],depends_on:["RA"],fire_name:["svg_cu:text3164"],draw_data:[[]],draw_name:[[]]};sim.poc.signals["SELB"]={name:"SELB",visible:true,type:"L",value:0,default_value:0,nbits:"6",behavior:["FIRE_IFCHANGED MRB SELB; RESET_CHANGED SELB"],depends_on:["RB"],fire_name:["svg_cu:text3168"],draw_data:[[]],draw_name:[[]]};sim.poc.signals["SELC"]={name:"SELC",visible:true,type:"L",value:0,default_value:0,nbits:"6",behavior:["FIRE_IFCHANGED MRC SELC; RESET_CHANGED SELC"],depends_on:["RC"],fire_name:["svg_cu:text3172"],draw_data:[[]],draw_name:[[]]};sim.poc.signals["SELCOP"]={name:"SELCOP",visible:true,type:"L",value:0,default_value:0,nbits:"5",behavior:["FIRE_IFCHANGED MC SELCOP; RESET_CHANGED SELCOP"],depends_on:["COP"],fire_name:["svg_cu:text3312"],draw_data:[[]],draw_name:[[]]};sim.poc.signals["EXCODE"]={name:"EXCODE",visible:true,type:"L",value:0,default_value:0,nbits:"4",behavior:["FIRE T11"],fire_name:["svg_cu:text3312-6"],draw_data:[[]],draw_name:[[]]};sim.poc.signals["RA"]={name:"RA",visible:true,type:"L",value:0,default_value:0,nbits:"6",forbidden:true,behavior:["GET RA_T9 BR RA; FIRE_IFSET T9 1; FIRE_IFSET MA 0"],depends_on:["SELA"],fire_name:["svg_p:text3107"],draw_data:[[]],draw_name:[["svg_p:path3109"]]};sim.poc.signals["RB"]={name:"RB",visible:true,type:"L",value:0,default_value:0,nbits:"6",forbidden:true,behavior:["GET RB_T10 BR RB; FIRE_IFSET T10 1; FIRE_IFSET MB 0"],depends_on:["SELB"],fire_name:["svg_p:text3123"],draw_data:[[]],draw_name:[["svg_p:path3113"]]};sim.poc.signals["RC"]={name:"RC",visible:true,type:"L",value:0,default_value:0,nbits:"6",forbidden:true,behavior:["FIRE LC"],depends_on:["SELC"],fire_name:["svg_p:text3125"],draw_data:[[]],draw_name:[["svg_p:path3117"]]};sim.poc.signals["LC"]={name:"LC",visible:true,type:"E",value:0,default_value:0,nbits:"1",behavior:["NOP","SET BR RC BUS_IB"],fire_name:["svg_p:text3127"],draw_data:[["svg_p:path3153","svg_p:path3151","svg_p:path3129"]],draw_name:[["svg_p:path3121"]]};sim.poc.signals["SE"]={name:"SE",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBITS SELEC_T3 0 REG_RT1 OFFSET SIZE 0 SE; FIRE T3","MBITS SELEC_T3 0 REG_RT1 OFFSET SIZE 0 SE; FIRE T3"],depends_on:["T3"],fire_name:["svg_p:text3593"],draw_data:[[]],draw_name:[["svg_p:path3591","svg_p:path3447-7-7"]]};sim.poc.signals["SIZE"]={name:"SIZE",visible:true,type:"L",value:0,default_value:0,nbits:"5",behavior:["MBITS SELEC_T3 0 REG_RT1 OFFSET SIZE 0 SE; FIRE T3"],depends_on:["T3"],fire_name:["svg_p:text3363"],draw_data:[[]],draw_name:[["svg_p:path3355"]]};sim.poc.signals["OFFSET"]={name:"OFFSET",visible:true,type:"L",value:0,default_value:0,nbits:"5",behavior:["MBITS SELEC_T3 0 REG_RT1 OFFSET SIZE 0 SE; FIRE T3"],depends_on:["T3"],fire_name:["svg_p:text3707"],draw_data:[[]],draw_name:[["svg_p:path3359"]]};sim.poc.signals["MC"]={name:"MC",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBIT COP REG_IR 0 5; FIRE_IFCHANGED COP MC","CP_FIELD COP REG_MICROINS/SELCOP; FIRE_IFCHANGED COP MC"],depends_on:["SELCOP"],fire_name:["svg_cu:text3322","svg_cu:text3172-1-5"],draw_data:[["svg_cu:path3320","svg_cu:path3142"],["svg_cu:path3318","svg_cu:path3502-6","svg_cu:path3232-6"]],draw_name:[[],["svg_cu:path3306"]]};sim.poc.signals["MRA"]={name:"MRA",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBIT_SN RA REG_IR REG_MICROINS/SELA 5; FIRE RA;","CP_FIELD RA REG_MICROINS/SELA; FIRE RA;"],depends_on:["SELA"],fire_name:["svg_cu:text3222"],draw_data:[["svg_cu:path3494","svg_cu:path3492","svg_cu:path3490","svg_cu:path3142b","svg_cu:path3188","svg_cu:path3190","svg_cu:path3192","svg_cu:path3194","svg_cu:path3276","svg_cu:path3290","svg_cu:path3260"],["svg_cu:path3270","svg_cu:path3258","svg_cu:path3260","svg_cu:path3294","svg_cu:path3288","svg_cu:path3280"]],draw_name:[[],["svg_cu:path3220"]]};sim.poc.signals["MRB"]={name:"MRB",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBIT_SN RB REG_IR REG_MICROINS/SELB 5; FIRE RB;","CP_FIELD RB REG_MICROINS/SELB; FIRE RB;"],depends_on:["SELB"],fire_name:["svg_cu:text3242"],draw_data:[["svg_cu:path3196","svg_cu:path3278","svg_cu:path3292"],["svg_cu:path3282","svg_cu:path3258-4","svg_cu:path3278","svg_cu:path3196"]],draw_name:[[],["svg_cu:path3240"]]};sim.poc.signals["MRC"]={name:"MRC",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MBIT_SN RC REG_IR REG_MICROINS/SELC 5; FIRE RC;","CP_FIELD RC REG_MICROINS/SELC; FIRE RC;"],depends_on:["SELC"],fire_name:["svg_cu:text3254"],draw_data:[["svg_cu:path3494","svg_cu:path3492","svg_cu:path3490","svg_cu:path3142b","svg_cu:path3188","svg_cu:path3190","svg_cu:path3192","svg_cu:path3194","svg_cu:path3276","svg_cu:path3290","svg_cu:path3232","svg_cu:path3292"],["svg_cu:path3300","svg_cu:path3294","svg_cu:path3292","svg_cu:path3288","svg_cu:path3232"]],draw_name:[[],["svg_cu:path3252"]]};sim.poc.signals["IOR"]={name:"IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MOVE_BITS SCR_IOR 0 1 IOR; FIRE SCR_IOR; MOVE_BITS IO_IOR 0 1 IOR; MOVE_BITS L3D_IOR 0 1 IOR; FIRE IO_IOR; MOVE_BITS KBD_IOR 0 1 IOR; FIRE KBD_IOR; FIRE L3D_IOR"],fire_name:[],draw_data:[[],["svg_p:path3733","svg_p:path3491","svg_p:text3715"]],draw_name:[[],[]]};sim.poc.signals["IOW"]={name:"IOW",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MOVE_BITS SCR_IOW 0 1 IOW; FIRE SCR_IOW; MOVE_BITS IO_IOW 0 1 IOW; FIRE IO_IOW; MOVE_BITS L3D_IOW 0 1 IOW; FIRE L3D_IOW"],fire_name:[],draw_data:[[],["svg_p:path3735","svg_p:path3491","svg_p:text3717"]],draw_name:[[],[]]};sim.poc.signals["TEST_C"]={name:"TEST_C",visible:true,type:"L",value:0,default_value:0,nbits:"1",forbidden:true,behavior:["MV FLAG_C VAL_ZERO; FIRE M7","MV FLAG_C VAL_ONE; FIRE M7"],depends_on:["SELCOP"],fire_name:["svg_p:text3701-3"],draw_data:[["svg_p:text3701-3"]],draw_name:[[]]};sim.poc.signals["TEST_V"]={name:"TEST_V",visible:true,type:"L",value:0,default_value:0,nbits:"1",forbidden:true,behavior:["MV FLAG_V VAL_ZERO; FIRE M7","MV FLAG_V VAL_ONE; FIRE M7"],depends_on:["SELCOP"],fire_name:["svg_p:text3701-3-1"],draw_data:[["svg_p:text3701-3-1"]],draw_name:[[]]};sim.poc.signals["TEST_N"]={name:"TEST_N",visible:true,type:"L",value:0,default_value:0,nbits:"1",forbidden:true,behavior:["MV FLAG_N VAL_ZERO; FIRE M7","MV FLAG_N VAL_ONE; FIRE M7"],depends_on:["SELCOP"],fire_name:["svg_p:text3701-3-2"],draw_data:[["svg_p:text3701-3-2"]],draw_name:[[]]};sim.poc.signals["TEST_Z"]={name:"TEST_Z",visible:true,type:"L",value:0,default_value:0,nbits:"1",forbidden:true,behavior:["MV FLAG_Z VAL_ZERO; FIRE M7","MV FLAG_Z VAL_ONE; FIRE M7"],depends_on:["SELCOP"],fire_name:["svg_p:text3701-3-5"],draw_data:[["svg_p:text3701-3-5"]],draw_name:[[]]};sim.poc.signals["TEST_I"]={name:"TEST_I",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV FLAG_I VAL_ZERO; FIRE M7","MV FLAG_I VAL_ONE; FIRE M7"],depends_on:["CLK"],fire_name:["svg_cu:text3440"],draw_data:[["svg_cu:text3440"]],draw_name:[[]]};sim.poc.signals["TEST_U"]={name:"TEST_U",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["MV FLAG_U VAL_ZERO; FIRE M7","MV FLAG_U VAL_ONE; FIRE M7"],depends_on:["CLK"],fire_name:["svg_cu:text3442"],draw_data:[["svg_cu:text3442"]],draw_name:[[]]};sim.poc.signals["TEST_INTV"]={name:"TEST_INTV",visible:true,type:"L",value:0,default_value:0,nbits:"8",forbidden:true,behavior:["MBIT INTV TEST_INTV 0 32"],depends_on:["INT"],fire_name:["svg_p:tspan4225"],draw_data:[["svg_p:path3749"]],draw_name:[[]]};sim.poc.behaviors["NOP"]={nparameters:1,operation:function(s_expr){},verbal:function(s_expr){return""}};sim.poc.behaviors["NOP_ALU"]={nparameters:1,operation:function(s_expr){sim.poc.internal_states.alu_flags.flag_n=0;sim.poc.internal_states.alu_flags.flag_z=0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){return"Reset ALU flags. "}};sim.poc.behaviors["MV"]={nparameters:3,types:["X","X"],operation:function(s_expr){sim_elto_org=get_reference(s_expr[2]);sim_elto_dst=get_reference(s_expr[1]);newval=get_value(sim_elto_org);set_value(sim_elto_dst,newval)},verbal:function(s_expr){var sim_elto_org=get_reference(s_expr[2]);var newval=get_value(sim_elto_org);var verbose=get_cfg("verbal_verbose");if(verbose!=="short"){return"Copy from "+show_verbal(s_expr[2])+" to "+show_verbal(s_expr[1])+" value "+show_value(newval)+". "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[2])+" ("+show_value(newval)+"). "}};sim.poc.behaviors["LOAD"]={nparameters:3,types:["X","X"],operation:function(s_expr){sim_elto_org=get_reference(s_expr[2]);sim_elto_dst=get_reference(s_expr[1]);newval=get_value(sim_elto_org);set_value(sim_elto_dst,newval)},verbal:function(s_expr){var sim_elto_org=get_reference(s_expr[2]);var newval=get_value(sim_elto_org);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Load from "+show_verbal(s_expr[2])+" to "+show_verbal(s_expr[1])+" value "+show_value(newval)+". "}return show_verbal(s_expr[1])+" = "+show_value(newval)+" ( "+show_verbal(s_expr[2])+"). "}};sim.poc.behaviors["CP_FIELD"]={nparameters:3,types:["X","X"],operation:function(s_expr){r=s_expr[2].split("/");sim_elto_org=get_reference(r[0]);newval=get_value(sim_elto_org);newval=newval[r[1]];if(typeof newval!="undefined"){sim_elto_dst=get_reference(s_expr[1]);set_value(sim_elto_dst,newval)}},verbal:function(s_expr){var r=s_expr[2].split("/");var sim_elto_org=get_reference(r[0]);var newval=get_value(sim_elto_org);newval=newval[r[1]];if(typeof newval=="undefined")newval="&lt;undefined&gt;";else newval=show_value(newval);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return'Copy from "'+show_verbal(r[0])+'"['+r[1]+"] "+"to "+show_verbal(s_expr[1])+" (value "+newval+"). "}return show_verbal(s_expr[1])+" = "+show_verbal(r[0])+"."+r[1]+" ("+newval+"). "}};sim.poc.behaviors["NOT_ES"]={nparameters:3,types:["S","E"],operation:function(s_expr){set_value(sim.poc.signals[s_expr[1]],Math.abs(get_value(sim.poc.states[s_expr[2]])-1))},verbal:function(s_expr){var value=Math.abs(get_value(sim.poc.states[s_expr[2]])-1);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Set "+show_verbal(s_expr[1])+" with value "+show_value(value)+" (Logical NOT of "+s_expr[2]+"). "}return show_verbal(s_expr[1])+" = "+show_value(value)+" (Logical NOT "+s_expr[2]+"). "}};sim.poc.behaviors["GET"]={nparameters:4,types:["E","E","S"],operation:function(s_expr){set_value(sim.poc.states[s_expr[1]],get_value(sim.poc.states[s_expr[2]][sim.poc.signals[s_expr[3]].value]))},verbal:function(s_expr){var value=get_value(sim.poc.states[s_expr[2]][sim.poc.signals[s_expr[3]].value]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Set "+show_verbal(s_expr[1])+" with value "+show_value(value)+" (Register File "+s_expr[3]+"). "}return show_verbal(s_expr[1])+" = "+show_value(value)+" (Register File "+s_expr[3]+"). "}};sim.poc.behaviors["SET"]={nparameters:4,types:["E","S","E"],operation:function(s_expr){set_value(sim.poc.states[s_expr[1]][sim.poc.signals[s_expr[2]].value],get_value(sim.poc.states[s_expr[3]]))},verbal:function(s_expr){var value=get_value(sim.poc.states[s_expr[3]]);var o_ref=sim.poc.states[s_expr[1]][sim.poc.signals[s_expr[2]].value];var o_verbal=o_ref.name;if(typeof o_ref.verbal!="undefined")o_verbal=o_ref.verbal;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy to "+o_verbal+" the value "+show_value(value)+". "}return o_verbal+" = "+show_value(value)+". "}};sim.poc.behaviors["AND"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])&get_value(sim.poc.states[s_expr[3]]);set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])&get_value(sim.poc.states[s_expr[3]]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU AND with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (AND). "}};sim.poc.behaviors["OR"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])|get_value(sim.poc.states[s_expr[3]]);set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])|get_value(sim.poc.states[s_expr[3]]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU OR with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (OR). "}};sim.poc.behaviors["NOT"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=~get_value(sim.poc.states[s_expr[2]]);set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=~get_value(sim.poc.states[s_expr[2]]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU NOT with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (NOT). "}};sim.poc.behaviors["XOR"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])^get_value(sim.poc.states[s_expr[3]]);set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])^get_value(sim.poc.states[s_expr[3]]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU XOR with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (XOR). "}};sim.poc.behaviors["SRL"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])>>>1;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])>>>1;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Shift Right Logical with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (SRL). "}};sim.poc.behaviors["SRA"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])>>1;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])>>1;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Shift Right Arithmetic with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (SRA). "}};sim.poc.behaviors["SL"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])<<1;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])<<1;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Shift Left with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (SL). "}};sim.poc.behaviors["RR"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])>>>1|(get_value(sim.poc.states[s_expr[2]])&1)<<31;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])>>>1|(get_value(sim.poc.states[s_expr[2]])&1)<<31;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Right Rotation with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (RR). "}};sim.poc.behaviors["RL"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])<<1|(get_value(sim.poc.states[s_expr[2]])&2147483648)>>>31;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])<<1|(get_value(sim.poc.states[s_expr[2]])&2147483648)>>>31;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Left Rotation with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (LR). "}};sim.poc.behaviors["ADD"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a+b;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=a>>>31&&b>>>31;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a+b;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU ADD with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (ADD). "}};sim.poc.behaviors["SUB"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a-b;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=a>>>31&&b>>>31;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a-b;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU SUB with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (SUB). "}};sim.poc.behaviors["MUL"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a*b;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=0;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a*b;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU MUL with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (MUL). "}};sim.poc.behaviors["DIV"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;if(0==b){set_value(sim.poc.states[s_expr[1]],0);sim.poc.internal_states.alu_flags.flag_n=0;sim.poc.internal_states.alu_flags.flag_z=1;sim.poc.internal_states.alu_flags.flag_v=1;sim.poc.internal_states.alu_flags.flag_c=0;return}var result=Math.floor(a/b);set_value(sim.poc.states[s_expr[1]],result);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;if(0==b){return"ALU DIV zero by zero (oops!). "}var result=Math.floor(a/b);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU DIV with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (DIV). "}};sim.poc.behaviors["MOD"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;if(0==b){set_value(sim.poc.states[s_expr[1]],0);sim.poc.internal_states.alu_flags.flag_n=0;sim.poc.internal_states.alu_flags.flag_z=1;sim.poc.internal_states.alu_flags.flag_v=1;sim.poc.internal_states.alu_flags.flag_c=0;return}var result=a%b;set_value(sim.poc.states[s_expr[1]],result);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;if(0==b){return"ALU MOD zero by zero (oops!). "}var result=a%b;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU MOD with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (MOD). "}};sim.poc.behaviors["LUI"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])<<16;set_value(sim.poc.states[s_expr[1]],result);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])<<16;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"ALU Load Upper Immediate with result "+show_value(result)+". "}return"ALU output = "+show_value(result)+" (LUI). "}};sim.poc.behaviors["ADDFOUR"]={nparameters:3,types:["E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a+4;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=a>>>31&&b>>>31;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a+4;return"ALU ADD 4 with result "+show_value(result)+". "}};sim.poc.behaviors["ADDONE"]={nparameters:3,types:["E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a+1;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=a>>>31&&b>>>31;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a+1;return"ALU ADD 1 with result "+show_value(result)+". "}};sim.poc.behaviors["SUBFOUR"]={nparameters:3,types:["E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a-4;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=a>>>31&&b>>>31;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a-4;return"ALU SUB 4 with result "+show_value(result)+". "}};sim.poc.behaviors["SUBONE"]={nparameters:3,types:["E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a-1;set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=a>>>31&&b>>>31;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a-1;return"ALU SUB 1 with result "+show_value(result)+". "}};sim.poc.behaviors["FADD"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a.toFixed(2)+b.toFixed(2);set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=0;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a.toFixed(2)+b.toFixed(2);return"ALU Float ADD with result "+result+". "}};sim.poc.behaviors["FSUB"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a.toFixed(2)-b.toFixed(2);set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=0;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a.toFixed(2)-b.toFixed(2);return"ALU Float SUB with result "+result+". "}};sim.poc.behaviors["FMUL"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a.toFixed(2)*b.toFixed(2);set_value(sim.poc.states[s_expr[1]],result>>>0);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_c=0;sim.poc.internal_states.alu_flags.flag_v=0;if(result<0&&a>=0&&b>=0)sim.poc.internal_states.alu_flags.flag_v=1;if(result>=0&&a<0&&b<0)sim.poc.internal_states.alu_flags.flag_v=1},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a.toFixed(2)*b.toFixed(2);return"ALU Float MUL with result "+result+". "}};sim.poc.behaviors["FDIV"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;if(0==b){set_value(sim.poc.states[s_expr[1]],0);sim.poc.internal_states.alu_flags.flag_n=0;sim.poc.internal_states.alu_flags.flag_z=1;sim.poc.internal_states.alu_flags.flag_v=1;sim.poc.internal_states.alu_flags.flag_c=0;return}var result=Math.floor(a/b);set_value(sim.poc.states[s_expr[1]],result);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a.toFixed(2)/b.toFixed(2);return"ALU Float DIV with result "+result+". "}};sim.poc.behaviors["FMOD"]={nparameters:4,types:["E","E","E"],operation:function(s_expr){var result=(get_value(sim.poc.states[s_expr[2]])<<0)%(get_value(sim.poc.states[s_expr[3]])<<0);set_value(sim.poc.states[s_expr[1]],result);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var b=get_value(sim.poc.states[s_expr[3]])<<0;var result=a.toFixed(2)%b.toFixed(2);return"ALU Float MOD with result "+result+". "}};sim.poc.behaviors["LUI"]={nparameters:3,types:["E","E"],operation:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])<<16;set_value(sim.poc.states[s_expr[1]],result);sim.poc.internal_states.alu_flags.flag_n=result<0?1:0;sim.poc.internal_states.alu_flags.flag_z=result==0?1:0;sim.poc.internal_states.alu_flags.flag_v=0;sim.poc.internal_states.alu_flags.flag_c=0},verbal:function(s_expr){var result=get_value(sim.poc.states[s_expr[2]])<<16;return"ALU Load Upper Immediate with result "+show_value(result)+". "}};sim.poc.behaviors["PLUS1"]={nparameters:3,types:["E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a+1;set_value(sim.poc.states[s_expr[1]],result>>>0)},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a+1;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Add one to "+show_verbal(s_expr[2])+" and copy to "+show_verbal(s_expr[1])+" with result "+show_value(result)+". "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[2])+" + 1"+" ("+show_value(result)+"). "}};sim.poc.behaviors["PLUS4"]={nparameters:3,types:["E","E"],operation:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a+4;set_value(sim.poc.states[s_expr[1]],result>>>0)},verbal:function(s_expr){var a=get_value(sim.poc.states[s_expr[2]])<<0;var result=a+4;var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Add four to "+show_verbal(s_expr[2])+" and copy to "+show_verbal(s_expr[1])+" with result "+show_value(result)+". "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[2])+" + 4"+" ("+show_value(result)+"). "}};sim.poc.behaviors["MBIT"]={nparameters:5,types:["X","X","I","I"],operation:function(s_expr){var sim_elto_dst=get_reference(s_expr[1]);var sim_elto_org=get_reference(s_expr[2]);var offset=parseInt(s_expr[3]);var size=parseInt(s_expr[4]);var n1=get_value(sim_elto_org).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(offset+size-1),size);set_value(sim_elto_dst,parseInt(n2,2))},verbal:function(s_expr){var sim_elto_dst=get_reference(s_expr[1]);var sim_elto_org=get_reference(s_expr[2]);var offset=parseInt(s_expr[3]);var size=parseInt(s_expr[4]);var n1=get_value(sim_elto_org).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(offset+size-1),size);var n3=parseInt(n2,2);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy from "+show_verbal(s_expr[2])+" to "+show_verbal(s_expr[1])+" value "+show_value(n3)+" (copied "+size+" bits from bit "+offset+"). "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[2])+" ("+show_value(n3)+", "+size+" bits from bit "+offset+"). "}};sim.poc.behaviors["MBIT_SN"]={nparameters:5,types:["S","E","E","I"],operation:function(s_expr){var base=0;var r=s_expr[3].split("/");if(1==r.length)base=get_value(sim.poc.states[s_expr[3]]);else if(typeof sim.poc.states[r[0]].value[r[1]]!="undefined")base=sim.poc.states[r[0]].value[r[1]];else if(typeof sim.poc.signals[r[1]].default_value!="undefined")base=sim.poc.signals[r[1]].default_value;else if(typeof sim.poc.states[r[1]].default_value!="undefined")base=sim.poc.states[r[1]].default_value;else ws_alert("WARN: undefined state/field pair -> "+r[0]+"/"+r[1]);var offset=parseInt(s_expr[4]);var n1=get_value(sim.poc.states[s_expr[2]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;var n3=n2.substr(31-(base+offset-1),offset);set_value(sim.poc.signals[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){var base=0;var r=s_expr[3].split("/");if(1==r.length)base=get_value(sim.poc.states[s_expr[3]]);else if(typeof sim.poc.states[r[0]].value[r[1]]!="undefined")base=sim.poc.states[r[0]].value[r[1]];else if(typeof sim.poc.signals[r[1]].default_value!="undefined")base=sim.poc.signals[r[1]].default_value;else if(typeof sim.poc.states[r[1]].default_value!="undefined")base=sim.poc.states[r[1]].default_value;else ws_alert("WARN: undefined state/field pair -> "+r[0]+"/"+r[1]);var offset=parseInt(s_expr[4]);var n1=get_value(sim.poc.states[s_expr[2]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;var n3=n2.substr(31-(base+offset-1),offset);var from_elto="";if(1==r.length)from_elto=show_verbal(s_expr[3]);else from_elto='"'+show_verbal(s_expr[2])+'"['+r[1]+"] ";var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy from "+from_elto+"into "+show_verbal(s_expr[1])+" "+"value "+parseInt(n3,2)+". "}return show_verbal(s_expr[1])+" = "+from_elto+" ("+parseInt(n3,2)+"). "}};sim.poc.behaviors["SBIT_SIGNAL"]={nparameters:4,types:["X","I","I"],operation:function(s_expr){sim_elto_dst=get_reference(s_expr[1]);var new_value=sim_elto_dst.value;var mask=1<<s_expr[3];if(s_expr[2]=="1")new_value=new_value|mask;else new_value=new_value&~mask;set_value(sim_elto_dst,new_value>>>0)},verbal:function(s_expr){sim_elto_dst=get_reference(s_expr[1]);var new_value=sim_elto_dst.value;var mask=1<<s_expr[3];if(s_expr[2]=="1")new_value=new_value|mask;else new_value=new_value&~mask;return compute_signal_verbals(s_expr[1],new_value>>>0)}};sim.poc.behaviors["UPDATE_FLAG"]={nparameters:4,types:["X","X","I"],operation:function(s_expr){sim_elto_org=get_reference(s_expr[2]);sim_elto_dst=get_reference(s_expr[1]);var new_value=sim_elto_dst.value&~(1<<s_expr[3])|sim_elto_org.value<<s_expr[3];set_value(sim_elto_dst,new_value>>>0)},verbal:function(s_expr){sim_elto_org=get_reference(s_expr[2]);sim_elto_dst=get_reference(s_expr[1]);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Update "+show_verbal(s_expr[2])+" to value "+sim_elto_org.value+". "}return show_verbal(s_expr[1])+"."+show_verbal(s_expr[3])+" = "+sim_elto_org.value+". "}};sim.poc.behaviors["MBITS"]={nparameters:8,types:["E","I","E","S","S","I","S"],operation:function(s_expr){var offset=parseInt(sim.poc.signals[s_expr[4]].value);var size=parseInt(sim.poc.signals[s_expr[5]].value);var n1=get_value(sim.poc.states[s_expr[3]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(offset+size-1),size);var n3="00000000000000000000000000000000".substring(0,32-n2.length)+n2;if("1"==sim.poc.signals[s_expr[7]].value&&"1"==n2.substr(0,1)){n3="11111111111111111111111111111111".substring(0,32-n2.length)+n2}set_value(sim.poc.states[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){var offset=parseInt(sim.poc.signals[s_expr[4]].value);var size=parseInt(sim.poc.signals[s_expr[5]].value);var n1=get_value(sim.poc.states[s_expr[3]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(offset+size-1),size);var n3="00000000000000000000000000000000".substring(0,32-n2.length)+n2;if("1"==sim.poc.signals[s_expr[7]].value&&"1"==n2.substr(0,1)){n3="11111111111111111111111111111111".substring(0,32-n2.length)+n2}n1=parseInt(n3,2);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return" Copy from "+show_verbal(s_expr[3])+" to "+show_verbal(s_expr[1])+" value "+show_value(n1)+" (copied "+size+" bits from bit "+offset+"). "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[3])+" ("+show_value(n1)+", "+size+" bits from bit "+offset+"). "}};sim.poc.behaviors["BSEL"]={nparameters:6,types:["E","I","I","E","I"],operation:function(s_expr){var posd=parseInt(s_expr[2]);var poso=parseInt(s_expr[5]);var len=parseInt(s_expr[3]);var n1=get_value(sim.poc.states[s_expr[4]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(poso+len)+1,len);var n3="00000000000000000000000000000000".substring(0,32-n2.length)+n2;var n4="00000000000000000000000000000000".substr(0,posd);n3=n3+n4;set_value(sim.poc.states[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){var posd=parseInt(s_expr[2]);var len=parseInt(s_expr[3]);var poso=parseInt(s_expr[5]);var n1=get_value(sim.poc.states[s_expr[4]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n2=n2.substr(31-(poso+len)+1,len);var n3="00000000000000000000000000000000".substring(0,32-n2.length)+n2;var n4="00000000000000000000000000000000".substr(0,posd);n3=n3+n4;var n5=parseInt(n3,2);var verbose=get_cfg("verbal_verbose");if(verbose!=="math"){return"Copy from "+show_verbal(s_expr[4])+" to "+show_verbal(s_expr[1])+" value "+show_value(n5)+" (copied "+len+" bits, from bit "+poso+" of "+s_expr[4]+" to bit "+posd+" of "+s_expr[1]+"). "}return show_verbal(s_expr[1])+" = "+show_verbal(s_expr[4])+" ("+show_value(n5)+", "+len+" bits, from bit "+poso+" of "+s_expr[4]+" to bit "+posd+" of "+s_expr[1]+"). "}};sim.poc.behaviors["EXT_SIG"]={nparameters:3,types:["E","I"],operation:function(s_expr){var n1=get_value(sim.poc.states[s_expr[1]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;var n3=n2.substr(31-s_expr[2],31);var n4=n3;if("1"==n2[31-s_expr[2]]){n4="11111111111111111111111111111111".substring(0,32-n3.length)+n4}set_value(sim.poc.states[s_expr[1]],parseInt(n4,2))},verbal:function(s_expr){var n1=get_value(sim.poc.states[s_expr[1]]).toString(2);var n2="00000000000000000000000000000000".substring(0,32-n1.length)+n1;var n3=n2.substr(31-s_expr[2],31);var n4=n3;if("1"==n2[31-s_expr[2]]){n4="11111111111111111111111111111111".substring(0,32-n3.length)+n4}var n5=parseInt(n4,2);return"Sign Extension with value "+show_value(n5)+". "}};sim.poc.behaviors["MOVE_BITS"]={nparameters:5,types:["S","I","I","S"],operation:function(s_expr){var posd=parseInt(s_expr[2]);var poso=0;var len=parseInt(s_expr[3]);var n1=sim.poc.signals[s_expr[4]].value.toString(2);n1="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n1=n1.substr(31-poso-len+1,len);var n2=sim.poc.signals[s_expr[1]].value.toString(2);n2="00000000000000000000000000000000".substring(0,32-n2.length)+n2;var m1=n2.substr(0,32-(posd+len));var m2=n2.substr(31-posd+1,posd);var n3=m1+n1+m2;set_value(sim.poc.signals[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){return""}};sim.poc.behaviors["MOVE_BITSE"]={nparameters:6,types:["S","I","I","E","I"],operation:function(s_expr){var posd=parseInt(s_expr[2]);var poso=parseInt(s_expr[5]);var len=parseInt(s_expr[3]);var n1=get_value(sim.poc.states[s_expr[4]]).toString(2);n1="00000000000000000000000000000000".substring(0,32-n1.length)+n1;n1=n1.substr(31-poso-len+1,len);var n2=sim.poc.signals[s_expr[1]].value.toString(2);n2="00000000000000000000000000000000".substring(0,32-n2.length)+n2;var m1=n2.substr(0,32-(posd+len));var m2=n2.substr(31-posd+1,posd);var n3=m1+n1+m2;set_value(sim.poc.signals[s_expr[1]],parseInt(n3,2))},verbal:function(s_expr){return""}};sim.poc.behaviors["DECO"]={nparameters:1,operation:function(s_expr){sim.poc.states["INEX"].value=0;var oi=decode_instruction(sim.poc.internal_states.FIRMWARE,sim.poc.ctrl_states.ir,get_value(sim.poc.states["REG_IR"]));if(null==oi.oinstruction){ws_alert("ERROR: undefined instruction code in firmware ("+"co:"+oi.op_code.toString(2)+", "+"cop:"+oi.cop_code.toString(2)+")");sim.poc.states["ROM_MUXA"].value=0;sim.poc.states["INEX"].value=1;return-1}var rom_addr=oi.op_code<<6;if(typeof oi.oinstruction.cop!="undefined"){rom_addr=rom_addr+oi.cop_code}if(typeof sim.poc.internal_states["ROM"][rom_addr]=="undefined"){ws_alert("ERROR: undefined rom address "+rom_addr+" in firmware");sim.poc.states["ROM_MUXA"].value=0;return-1}sim.poc.states["ROM_MUXA"].value=sim.poc.internal_states["ROM"][rom_addr];var val=get_value(sim.poc.states["DECO_INS"]);set_value(sim.poc.states["DECO_INS"],val+1);var pc=get_value(sim.poc.states["REG_PC"])-4;var decins=get_deco_from_pc(pc);set_value(sim.poc.states["REG_IR_DECO"],decins);show_dbg_ir(get_value(sim.poc.states["REG_IR_DECO"]))},verbal:function(s_expr){return"Decode instruction. "}};sim.poc.behaviors["FIRE"]={nparameters:2,types:["S"],operation:function(s_expr){if(sim.poc.internal_states.fire_stack.indexOf(s_expr[1])!=-1){return}sim.poc.internal_states.fire_stack.push(s_expr[1]);update_draw(sim.poc.signals[s_expr[1]],sim.poc.signals[s_expr[1]].value);if("L"==sim.poc.signals[s_expr[1]].type){update_state(s_expr[1])}sim.poc.internal_states.fire_stack.pop(s_expr[1]);check_buses(s_expr[1])},verbal:function(s_expr){return""}};sim.poc.behaviors["FIRE_IFSET"]={nparameters:3,types:["S","I"],operation:function(s_expr){if(get_value(sim.poc.signals[s_expr[1]])!=parseInt(s_expr[2])){return}sim.poc.behaviors["FIRE"].operation(s_expr)},verbal:function(s_expr){return""}};sim.poc.behaviors["FIRE_IFCHANGED"]={nparameters:3,types:["S","X"],operation:function(s_expr){sim_elto=get_reference(s_expr[2]);if(sim_elto.changed==false)return;sim.poc.behaviors["FIRE"].operation(s_expr)},verbal:function(s_expr){return""}};sim.poc.behaviors["RESET_CHANGED"]={nparameters:2,types:["X"],operation:function(s_expr){sim_elto=get_reference(s_expr[1]);sim_elto.changed=false},verbal:function(s_expr){return""}};sim.poc.behaviors["CLOCK"]={nparameters:1,operation:function(s_expr){var val=get_value(sim.poc.states["CLK"]);set_value(sim.poc.states["CLK"],val+1);for(var i=0;i<jit_fire_order.length;i++){fn_updateE_now(jit_fire_order[i])}var new_maddr=get_value(sim.poc.states["MUXA_MICROADDR"]);set_value(sim.poc.states["REG_MICROADDR"],new_maddr);if(typeof sim.poc.internal_states["MC"][new_maddr]!="undefined")var new_mins=Object.create(sim.poc.internal_states["MC"][new_maddr]);else var new_mins=Object.create(sim.poc.states["REG_MICROINS"].default_value);sim.poc.states["REG_MICROINS"].value=new_mins;for(var key in sim.poc.signals){if(typeof new_mins[key]!="undefined")set_value(sim.poc.signals[key],new_mins[key]);else set_value(sim.poc.signals[key],sim.poc.signals[key].default_value)}for(var i=0;i<jit_fire_order.length;i++){fn_updateL_now(jit_fire_order[i])}if(typeof new_mins.NATIVE_JIT!="undefined")new_mins.NATIVE_JIT();else if(typeof new_mins.NATIVE!="undefined")eval(new_mins.NATIVE)},verbal:function(s_expr){return""}};sim.poc.behaviors["CPU_RESET"]={nparameters:1,operation:function(s_expr){for(var key in sim.poc.states){reset_value(sim.poc.states[key])}for(var key in sim.poc.signals){reset_value(sim.poc.signals[key])}},verbal:function(s_expr){return"Reset CPU. "}};sim.poc.behaviors["UPDATEDPC"]={nparameters:1,operation:function(s_expr){show_asmdbg_pc()},verbal:function(s_expr){return""}};sim.poc.behaviors["UPDATE_NZVC"]={nparameters:1,operation:function(s_expr){set_value(simhw_sim_state("FLAG_N"),sim.poc.internal_states.alu_flags.flag_n);set_value(simhw_sim_state("FLAG_Z"),sim.poc.internal_states.alu_flags.flag_z);set_value(simhw_sim_state("FLAG_V"),sim.poc.internal_states.alu_flags.flag_v);set_value(simhw_sim_state("FLAG_C"),sim.poc.internal_states.alu_flags.flag_c);set_value(simhw_sim_signal("TEST_N"),sim.poc.internal_states.alu_flags.flag_n);set_value(simhw_sim_signal("TEST_Z"),sim.poc.internal_states.alu_flags.flag_z);set_value(simhw_sim_signal("TEST_V"),sim.poc.internal_states.alu_flags.flag_v);set_value(simhw_sim_signal("TEST_C"),sim.poc.internal_states.alu_flags.flag_c);update_draw(sim.poc.signals["TEST_N"],sim.poc.signals["TEST_N"].value);update_draw(sim.poc.signals["TEST_Z"],sim.poc.signals["TEST_Z"].value);update_draw(sim.poc.signals["TEST_V"],sim.poc.signals["TEST_V"].value);update_draw(sim.poc.signals["TEST_C"],sim.poc.signals["TEST_C"].value)},verbal:function(s_expr){return"Update flags N-Z-V-C."}};sim.poc.components.MEMORY={name:"MEMORY",version:"1",abilities:["MEMORY"],details_name:["MEMORY","MEMORY_CONFIG"],details_fire:[["svg_p:text3001"],[]],write_state:function(vec){if(typeof vec.MEMORY=="undefined")vec.MEMORY={};var key=0;var value=0;for(var index in sim.poc.internal_states.MP){value=parseInt(sim.poc.internal_states.MP[index]);if(value!=0){key=parseInt(index).toString(16);vec.MEMORY["0x"+key]={type:"memory",default_value:0,id:"0x"+key,op:"=",value:"0x"+value.toString(16)}}}return vec},read_state:function(vec,check){if(typeof vec.MEMORY=="undefined")vec.MEMORY={};var key=parseInt(check.id).toString(16);var val=parseInt(check.value).toString(16);if("MEMORY"==check.type.toUpperCase().trim()){vec.MEMORY["0x"+key]={type:"memory",default_value:0,id:"0x"+key,op:check.condition,value:"0x"+val};return true}return false},get_state:function(pos){var index=parseInt(pos);if(typeof sim.poc.internal_states.MP[index]!="undefined"){return"0x"+parseInt(sim.poc.internal_states.MP[index]).toString(16)}return null},get_value:function(elto){return simhw_internalState_get("MP",elto)>>>0},set_value:function(elto,value){simhw_internalState_set("MP",elto,value);return value}};sim.poc.internal_states.segments={};sim.poc.internal_states.MP={};sim.poc.internal_states.MP_wc=0;sim.poc.signals.MRDY={name:"MRDY",visible:true,type:"L",value:0,default_value:0,nbits:"1",depends_on:["CLK"],behavior:["FIRE_IFCHANGED MRDY C","FIRE_IFCHANGED MRDY C"],fire_name:["svg_p:tspan3916"],draw_data:[[],["svg_p:path3895","svg_p:path3541"]],draw_name:[[],[]]};sim.poc.signals.R={name:"R",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MEM_READ BUS_AB BUS_DB BW MRDY CLK; FIRE M1; FIRE MRDY"],fire_name:["svg_p:text3533-5-2"],draw_data:[[],["svg_p:path3557","svg_p:path3571"]],draw_name:[[],[]]};sim.poc.signals.W={name:"W",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","MEM_WRITE BUS_AB BUS_DB BW MRDY CLK; FIRE M1; FIRE MRDY"],fire_name:["svg_p:text3533-5-08"],draw_data:[[],["svg_p:path3559","svg_p:path3575","svg_p:path3447-7"]],draw_name:[[],[]]};sim.poc.signals.BW={name:"BW",verbal:["Access to one byte from memory. ","Access to two bytes from memory. ","Access to three bytes from memory. ","Access to a word from memory. "],visible:true,type:"L",value:0,default_value:0,nbits:"2",behavior:["FIRE R; FIRE W","FIRE R; FIRE W","FIRE R; FIRE W","FIRE R; FIRE W"],fire_name:["svg_p:text3533-5-2-8"],draw_data:[["svg_p:path3557-0"]],draw_name:[[],[]]};sim.poc.behaviors.MEM_READ={nparameters:6,types:["E","E","S","S","E"],operation:function(s_expr){var address=sim.poc.states[s_expr[1]].value;var dbvalue=sim.poc.states[s_expr[2]].value;var bw=sim.poc.signals[s_expr[3]].value;var clk=get_value(sim.poc.states[s_expr[5]].value);sim.poc.signals[s_expr[4]].value=0;var remain=get_var(sim.poc.internal_states.MP_wc);if(typeof sim.poc.events.mem[clk-1]!="undefined"&&sim.poc.events.mem[clk-1]>0){remain=sim.poc.events.mem[clk-1]-1}sim.poc.events.mem[clk]=remain;if(remain>0){return}var value=0;var wordress=address&4294967292;if(typeof sim.poc.internal_states.MP[wordress]!="undefined")value=sim.poc.internal_states.MP[wordress];switch(bw){case 0:if(0==(address&3))dbvalue=value&255;if(1==(address&3))dbvalue=(value&65280)>>8;if(2==(address&3))dbvalue=(value&16711680)>>16;if(3==(address&3))dbvalue=(value&4278190080)>>24;break;case 1:if(0==(address&3))dbvalue=value&65535;if(1==(address&3))dbvalue=value&65535;if(2==(address&3))dbvalue=(value&4294901760)>>16;if(3==(address&3))dbvalue=(value&4294901760)>>16;break;case 2:if(0==(address&3))dbvalue=value&16777215;if(1==(address&3))dbvalue=value&4294967040;break;case 3:dbvalue=value;break}sim.poc.states[s_expr[2]].value=dbvalue>>>0;sim.poc.signals[s_expr[4]].value=1;show_main_memory(sim.poc.internal_states.MP,wordress,false,false)},verbal:function(s_expr){var verbal="";var address=sim.poc.states[s_expr[1]].value;var dbvalue=sim.poc.states[s_expr[2]].value;var bw=sim.poc.signals[s_expr[3]].value;var clk=get_value(sim.poc.states[s_expr[5]].value);switch(bw){case 0:bw_type="byte";break;case 1:bw_type="half";break;case 2:bw_type="three bytes";break;case 3:bw_type="word";break}var value=0;if(typeof sim.poc.internal_states.MP[address]!="undefined")value=sim.poc.internal_states.MP[address];verbal="Try to read a "+bw_type+" from memory "+"at address 0x"+address.toString(16)+" with value "+value.toString(16)+". ";return verbal}};sim.poc.behaviors.MEM_WRITE={nparameters:6,types:["E","E","S","S","E"],operation:function(s_expr){var address=sim.poc.states[s_expr[1]].value;var dbvalue=sim.poc.states[s_expr[2]].value;var bw=sim.poc.signals[s_expr[3]].value;var clk=get_value(sim.poc.states[s_expr[5]].value);sim.poc.signals[s_expr[4]].value=0;var remain=get_var(sim.poc.internal_states.MP_wc);if(typeof sim.poc.events.mem[clk-1]!="undefined"&&sim.poc.events.mem[clk-1]>0){remain=sim.poc.events.mem[clk-1]-1}sim.poc.events.mem[clk]=remain;if(remain>0)return;var value=0;var wordress=address&4294967292;if(typeof sim.poc.internal_states.MP[wordress]!="undefined")value=sim.poc.internal_states.MP[wordress];switch(bw){case 0:if(0==(address&3))value=value&4294967040|dbvalue&255;if(1==(address&3))value=value&4294902015|(dbvalue&255)<<8;if(2==(address&3))value=value&4278255615|(dbvalue&255)<<16;if(3==(address&3))value=value&16777215|(dbvalue&255)<<24;break;case 1:if(0==(address&3))value=value&4294901760|dbvalue&65535;if(1==(address&3))value=value&4294901760|dbvalue&65535;if(2==(address&3))value=value&65535|(dbvalue&65535)<<16;if(3==(address&3))value=value&65535|(dbvalue&65535)<<16;break;case 2:if(0==(address&3))value=value&4278190080|dbvalue&16777215;if(1==(address&3))value=value&255|dbvalue&4294967040;break;case 3:value=dbvalue;break}sim.poc.internal_states.MP[wordress]=value>>>0;sim.poc.signals[s_expr[4]].value=1;show_main_memory(sim.poc.internal_states.MP,wordress,true,true)},verbal:function(s_expr){var verbal="";var address=sim.poc.states[s_expr[1]].value;var dbvalue=sim.poc.states[s_expr[2]].value;var bw=sim.poc.signals[s_expr[3]].value;var clk=get_value(sim.poc.states[s_expr[5]].value);switch(bw){case 0:bw_type="byte";break;case 1:bw_type="half";break;case 2:bw_type="three bytes";break;case 3:bw_type="word";break}var value=0;if(typeof sim.poc.internal_states.MP[address]!="undefined")value=sim.poc.internal_states.MP[address];verbal="Try to write a "+bw_type+" to memory "+"at address 0x"+address.toString(16)+" with value "+value.toString(16)+". ";return verbal}};sim.poc.behaviors.MEMORY_RESET={nparameters:1,operation:function(s_expr){sim.poc.events.mem={}},verbal:function(s_expr){return"Reset the memory (all values will be zeroes). "}};sim.poc.components.IO={name:"IO",version:"1",abilities:["IO_TIMER"],details_name:["IO_STATS","IO_CONFIG"],details_fire:[["svg_p:text3775"],[]],write_state:function(vec){return vec},read_state:function(o,check){return false},get_state:function(reg){return null},get_value:function(elto){var associated_state=simhw_internalState_get("io_hash",elto);var value=get_value(simhw_sim_state(associated_state))>>>0;set_value(simhw_sim_state("BUS_AB"),elto);set_value(simhw_sim_signal("IOR"),1);compute_behavior("FIRE IOR");value=get_value(simhw_sim_state("BUS_DB"));return value},set_value:function(elto,value){var associated_state=simhw_internalState_get("io_hash",elto);set_value(simhw_sim_state(associated_state),value);set_value(simhw_sim_state("BUS_AB"),elto);set_value(simhw_sim_state("BUS_DB"),value);set_value(simhw_sim_signal("IOW"),1);compute_behavior("FIRE IOW");return value}};sim.poc.internal_states.io_int_factory=[];sim.poc.internal_states.io_int_factory[0]={period:0,probability:.5,accumulated:0,active:false};sim.poc.internal_states.io_int_factory[1]={period:0,probability:.5,accumulated:0,active:false};sim.poc.internal_states.io_int_factory[2]={period:0,probability:.5,accumulated:0,active:false};sim.poc.internal_states.io_int_factory[3]={period:0,probability:.5,accumulated:0,active:false};sim.poc.internal_states.io_int_factory[4]={period:0,probability:.5,accumulated:0,active:false};sim.poc.internal_states.io_int_factory[5]={period:0,probability:.5,accumulated:0,active:false};sim.poc.internal_states.io_int_factory[6]={period:0,probability:.5,accumulated:0,active:false};sim.poc.internal_states.io_int_factory[7]={period:0,probability:.5,accumulated:0,active:false};var IOSR_ID=4352;var IOCR_ID=4356;var IODR_ID=4360;sim.poc.internal_states.io_hash[IOSR_ID]="IOSR";sim.poc.internal_states.io_hash[IOCR_ID]="IOCR";sim.poc.internal_states.io_hash[IODR_ID]="IODR";sim.poc.states.IOSR={name:"IOSR",verbal:"IO State Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.IOCR={name:"IOCR",verbal:"IO Control Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.IODR={name:"IODR",verbal:"IO Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.signals.INT={name:"INT",visible:true,type:"L",value:0,default_value:0,nbits:"1",depends_on:["CLK"],behavior:["FIRE C","FIRE C"],fire_name:["svg_p:tspan4199"],draw_data:[[],["svg_p:path3809"]],draw_name:[[],[]]};sim.poc.signals.IORDY={name:"IORDY",visible:true,type:"L",value:0,default_value:0,nbits:"1",depends_on:["CLK"],behavior:["FIRE_IFCHANGED IORDY C","FIRE_IFCHANGED IORDY C"],fire_name:["svg_p:tspan4089","svg_p:path3793","svg_p:tspan4089"],draw_data:[[],["svg_p:path3897"]],draw_name:[[],[]]};sim.poc.signals.IO_IOR={name:"IO_IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","IO_IOR BUS_AB BUS_DB IOSR IOCR IODR CLK; FIRE M1"],fire_name:["svg_p:tspan4173"],draw_data:[[],["svg_p:path3795","svg_p:path3733"]],draw_name:[[],[]]};sim.poc.signals.IO_IOW={name:"IO_IOW",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","IO_IOW BUS_AB BUS_DB IOSR IOCR IODR CLK; FIRE M1"],fire_name:["svg_p:text3785-0-6-0-5-5"],draw_data:[[],["svg_p:path3805","svg_p:path3733"]],draw_name:[[],[]]};sim.poc.signals.IO_IE={name:"IO_IE",visible:true,type:"L",value:1,default_value:1,nbits:"1",behavior:["NOP","IO_CHK_I CLK INT INTV; FIRE C"],fire_name:[],draw_data:[[],[]],draw_name:[[],[]]};sim.poc.signals.INTA={name:"INTA",visible:true,type:"L",value:1,default_value:0,nbits:"1",behavior:["NOP","INTA CLK INT INTA BUS_DB INTV; FIRE M1; FIRE C"],fire_name:["svg_p:text3785-0-6-0-5-5-1-1"],draw_data:[[],["svg_p:path3807","svg_p:path3737"]],draw_name:[[],[]]};sim.poc.behaviors.IO_IOR={nparameters:7,types:["E","E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.poc.states[s_expr[1]]);var iosr=get_value(sim.poc.states[s_expr[3]]);var iocr=get_value(sim.poc.states[s_expr[4]]);var iodr=get_value(sim.poc.states[s_expr[5]]);if(bus_ab==IOSR_ID)set_value(sim.poc.states[s_expr[2]],iosr);if(bus_ab==IOCR_ID)set_value(sim.poc.states[s_expr[2]],iocr);if(bus_ab==IODR_ID)set_value(sim.poc.states[s_expr[2]],iodr)},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.poc.states[s_expr[1]]);var iosr=get_value(sim.poc.states[s_expr[3]]);var iocr=get_value(sim.poc.states[s_expr[4]]);var iodr=get_value(sim.poc.states[s_expr[5]]);if(bus_ab==IOSR_ID)verbal="I/O device read at IOSR of value "+iosr+". ";if(bus_ab==IOCR_ID)verbal="I/O device read at IOCR of value "+iocr+". ";if(bus_ab==IODR_ID)verbal="I/O device read at IODR of value "+iodr+". ";return verbal}};sim.poc.behaviors.IO_IOW={nparameters:7,types:["E","E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.poc.states[s_expr[1]]);var bus_db=get_value(sim.poc.states[s_expr[2]]);if(bus_ab!=IOSR_ID&&bus_ab!=IOCR_ID&&bus_ab!=IODR_ID){return}if(bus_ab==IOSR_ID)set_value(sim.poc.states[s_expr[3]],bus_db);if(bus_ab==IOCR_ID)set_value(sim.poc.states[s_expr[4]],bus_db);if(bus_ab==IODR_ID)set_value(sim.poc.states[s_expr[5]],bus_db);var iocr_id=get_value(sim.poc.states[s_expr[4]]);var iodr_id=get_value(sim.poc.states[s_expr[5]]);if(iocr_id<0||iocr_id>7)return;set_var(sim.poc.internal_states.io_int_factory[iocr_id].period,iodr_id);set_var(sim.poc.internal_states.io_int_factory[iocr_id].probability,1);if(0==iodr_id)set_var(sim.poc.internal_states.io_int_factory[iocr_id].probability,0)},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.poc.states[s_expr[1]]);var bus_db=get_value(sim.poc.states[s_expr[2]]);if(bus_ab==IOSR_ID)verbal="I/O device write at IOSR with value "+bus_db+". ";if(bus_ab==IOCR_ID)verbal="I/O device write at IOCR with value "+bus_db+". ";if(bus_ab==IODR_ID)verbal="I/O device write at IODR with value "+bus_db+". ";return verbal}};sim.poc.behaviors.IO_CHK_I={nparameters:4,types:["E","S","E"],operation:function(s_expr){var clk=get_value(sim.poc.states[s_expr[1]]);for(var i=sim.poc.internal_states.io_int_factory.length-1;i>=0;i--){if(get_var(sim.poc.internal_states.io_int_factory[i].period)==0)continue;if(get_var(sim.poc.internal_states.io_int_factory[i].active)==true){set_value(sim.poc.signals[s_expr[2]],1);set_value(sim.poc.states[s_expr[3]],i)}if(clk%get_var(sim.poc.internal_states.io_int_factory[i].period)==0){if(Math.random()>get_var(sim.poc.internal_states.io_int_factory[i].probability))continue;set_var(sim.poc.internal_states.io_int_factory[i].accumulated,get_var(sim.poc.internal_states.io_int_factory[i].accumulated)+1);set_var(sim.poc.internal_states.io_int_factory[i].active,true);if(typeof sim.poc.events.io[clk]=="undefined")sim.poc.events.io[clk]=[];sim.poc.events.io[clk].push(i);set_value(sim.poc.signals[s_expr[2]],1);set_value(sim.poc.states[s_expr[3]],i)}}},verbal:function(s_expr){return"Check I/O Interruption. "}};sim.poc.behaviors.INTA={nparameters:6,types:["E","S","S","E","E"],operation:function(s_expr){var clk=get_value(sim.poc.states[s_expr[1]]);if(typeof sim.poc.events.io[clk]!="undefined"){set_value(sim.poc.states[s_expr[4]],sim.poc.events.io[clk][0]);return}set_value(sim.poc.signals[s_expr[2]],0);set_value(sim.poc.states[s_expr[5]],0);for(var i=0;i<sim.poc.internal_states.io_int_factory.length;i++){if(get_var(sim.poc.internal_states.io_int_factory[i].active)){set_value(sim.poc.signals[s_expr[2]],0);set_value(sim.poc.states[s_expr[5]],i);set_value(sim.poc.states[s_expr[4]],i);if(typeof sim.poc.events.io[clk]=="undefined")sim.poc.events.io[clk]=[];sim.poc.events.io[clk].push(i);set_var(sim.poc.internal_states.io_int_factory[i].active,false);break}}},verbal:function(s_expr){return"Signal an interruption ACK. "}};sim.poc.behaviors.IO_RESET={nparameters:1,operation:function(s_expr){sim.poc.events.io={};for(var i=0;i<sim.poc.internal_states.io_int_factory.length;i++){set_var(sim.poc.internal_states.io_int_factory[i].accumulated,0);set_var(sim.poc.internal_states.io_int_factory[i].active,false)}},verbal:function(s_expr){return"Reset the I/O device. "}};sim.poc.components.KBD={name:"KBD",version:"1",abilities:["KEYBOARD"],details_name:["KEYBOARD"],details_fire:[["svg_p:text3829"]],write_state:function(vec){return vec},read_state:function(o,check){return false},get_state:function(reg){return null},get_value:function(elto){return sim.poc.internal_states.keyboard_content},set_value:function(elto,value){sim.poc.internal_states.keyboard_content=value;return value}};var KBDR_ID=256;var KBSR_ID=260;sim.poc.internal_states.io_hash[KBDR_ID]="KBDR";sim.poc.internal_states.io_hash[KBSR_ID]="KBSR";sim.poc.internal_states.keyboard_content="";sim.poc.states.KBDR={name:"KBDR",verbal:"Keyboard Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.KBSR={name:"KBSR",verbal:"Keyboard Status Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.signals.KBD_IOR={name:"KBD_IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","KBD_IOR BUS_AB BUS_DB KBDR KBSR CLK; FIRE M1"],fire_name:["svg_p:tspan4057"],draw_data:[[],["svg_p:path3863","svg_p:path3847"]],draw_name:[[],[]]};sim.poc.behaviors.KBD_IOR={nparameters:6,types:["E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.poc.states[s_expr[1]]);var clk=get_value(sim.poc.states[s_expr[5]]);if(bus_ab!=KBDR_ID&&bus_ab!=KBSR_ID){return}if(typeof sim.poc.events.keybd[clk]!="undefined"){if(bus_ab==KBDR_ID)set_value(sim.poc.states[s_expr[2]],sim.poc.events.keybd[clk]);if(bus_ab==KBSR_ID)set_value(sim.poc.states[s_expr[2]],1);return}if(get_value(sim.poc.states[s_expr[4]])==0){var keybuffer=get_keyboard_content();if(keybuffer.length!==0){var keybuffer_rest=keybuffer.substr(1,keybuffer.length-1);set_keyboard_content(keybuffer_rest);set_value(sim.poc.states[s_expr[4]],1);set_value(sim.poc.states[s_expr[3]],keybuffer[0].charCodeAt(0))}}if(get_value(sim.poc.states[s_expr[4]])==1){sim.poc.events.keybd[clk]=get_value(sim.poc.states[s_expr[3]])}if(bus_ab==KBSR_ID){set_value(sim.poc.states[s_expr[2]],get_value(sim.poc.states[s_expr[4]]))}if(bus_ab==KBDR_ID){if(get_value(sim.poc.states[s_expr[4]])==1)set_value(sim.poc.states[s_expr[2]],get_value(sim.poc.states[s_expr[3]]));set_value(sim.poc.states[s_expr[4]],0)}},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.poc.states[s_expr[1]]);var clk=get_value(sim.poc.states[s_expr[5]]);if(bus_ab==KBDR_ID)verbal="Read the screen data: "+sim.poc.states[s_expr[2]]+". ";if(bus_ab==KBSR_ID)verbal="Read the screen state: "+sim.poc.states[s_expr[2]]+". ";return verbal}};sim.poc.behaviors.KBD_RESET={nparameters:1,operation:function(s_expr){sim.poc.events.keybd={}},verbal:function(s_expr){return"Reset the keyboard content. "}};sim.poc.components.SCREEN={name:"SCREEN",version:"1",abilities:["SCREEN"],details_name:["SCREEN"],details_fire:[["svg_p:text3845"]],write_state:function(vec){if(typeof vec.SCREEN=="undefined"){vec.SCREEN={}}var sim_screen=sim.poc.internal_states.screen_content;var sim_lines=sim_screen.trim().split("\n");for(var i=0;i<sim_lines.length;i++){value=sim_lines[i];if(value!=""){vec.SCREEN[i]={type:"screen",default_value:"",id:i,op:"==",value:value}}}return vec},read_state:function(vec,check){if(typeof vec.SCREEN=="undefined"){vec.SCREEN={}}if("SCREEN"==check.type.toUpperCase().trim()){vec.SCREEN[check.id]={type:"screen",default_value:"",id:check.id,op:check.condition,value:check.value};return true}return false},get_state:function(line){var sim_screen=sim.poc.internal_states.screen_content;var sim_lines=sim_screen.trim().split("\n");var index=parseInt(line);if(typeof sim_lines[index]!="undefined"){return sim_lines[index]}return null},get_value:function(elto){return sim.poc.internal_states.screen_content},set_value:function(elto,value){sim.poc.internal_states.screen_content=value;return value}};var DDR_ID=4096;var DSR_ID=4100;sim.poc.internal_states.io_hash[DDR_ID]="DDR";sim.poc.internal_states.io_hash[DSR_ID]="DSR";sim.poc.internal_states.screen_content="";sim.poc.states.DDR={name:"DDR",verbal:"Display Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.DSR={name:"DSR",verbal:"Display State Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.signals.SCR_IOR={name:"SCR_IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","SCR_IOR BUS_AB BUS_DB DDR DSR CLK"],fire_name:["svg_p:tspan4004"],draw_data:[[],["svg_p:path3871","svg_p:path3857"]],draw_name:[[],[]]};sim.poc.signals.SCR_IOW={name:"SCR_IOW",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","SCR_IOW BUS_AB BUS_DB DDR DSR CLK"],fire_name:["svg_p:tspan4006"],draw_data:[[],["svg_p:path3873","svg_p:path3857"]],draw_name:[[],[]]};sim.poc.behaviors.SCR_IOR={nparameters:6,types:["E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.poc.states[s_expr[1]]);var ddr=get_value(sim.poc.states[s_expr[3]]);var dsr=get_value(sim.poc.states[s_expr[4]]);if(bus_ab==DDR_ID)set_value(sim.poc.states[s_expr[2]],ddr);if(bus_ab==DSR_ID)set_value(sim.poc.states[s_expr[2]],dsr)},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.poc.states[s_expr[1]]);var ddr=get_value(sim.poc.states[s_expr[3]]);var dsr=get_value(sim.poc.states[s_expr[4]]);if(bus_ab==DDR_ID)verbal="Try to read from the screen the DDR value "+ddr+". ";if(bus_ab==DDR_ID)verbal="Try to read into the screen the DSR value "+dsr+". ";return verbal}};sim.poc.behaviors.SCR_IOW={nparameters:6,types:["E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.poc.states[s_expr[1]]);var bus_db=get_value(sim.poc.states[s_expr[2]]);var clk=get_value(sim.poc.states[s_expr[5]]);var ch=String.fromCharCode(bus_db);if(bus_ab!=DDR_ID){return}if(ch==String.fromCharCode(7)){timbre.reset();var s1=T("sin",{freq:440,mul:.5});var s2=T("sin",{freq:660,mul:.5});T("perc",{r:500},s1,s2).on("ended",(function(){this.pause()})).bang().play()}else{var screen=get_screen_content();if(typeof sim.poc.events.screen[clk]!="undefined")screen=screen.substr(0,screen.length-1);set_screen_content(screen+String.fromCharCode(bus_db))}set_value(sim.poc.states[s_expr[3]],bus_db);set_value(sim.poc.states[s_expr[4]],1);sim.poc.events.screen[clk]=bus_db},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.poc.states[s_expr[1]]);var bus_db=get_value(sim.poc.states[s_expr[2]]);var clk=get_value(sim.poc.states[s_expr[5]]);var ch=String.fromCharCode(bus_db);if(bus_ab==DDR_ID)verbal="Try to write into the screen the code "+ch+" at clock cycle "+clk+". ";return verbal}};sim.poc.behaviors.SCREEN_RESET={nparameters:1,operation:function(s_expr){sim.poc.events.screen={}},verbal:function(s_expr){return"Reset the screen content. "}};sim.poc.components.L3D={name:"L3D",version:"1",abilities:["3DLED"],details_name:["3DLED"],details_fire:[[]],write_state:function(vec){return vec},read_state:function(o,check){return false},get_state:function(reg){return null},get_value:function(elto){var associated_state=simhw_internalState_get("io_hash",elto);var value=get_value(simhw_sim_state(associated_state))>>>0;set_value(simhw_sim_state("BUS_AB"),elto);set_value(simhw_sim_signal("L3DR"),1);compute_behavior("FIRE L3DR");value=get_value(simhw_sim_state("BUS_DB"));return value},set_value:function(elto,value){var associated_state=simhw_internalState_get("io_hash",elto);set_value(simhw_sim_state(associated_state),value);set_value(simhw_sim_state("BUS_AB"),elto);set_value(simhw_sim_state("BUS_DB"),value);set_value(simhw_sim_signal("L3DW"),1);compute_behavior("FIRE L3DW");return value}};sim.poc.internal_states.l3d_dim=4;sim.poc.internal_states.l3d_neltos=Math.pow(sim.poc.internal_states.l3d_dim,3);sim.poc.internal_states.l3d_state=Array.from({length:sim.poc.internal_states.l3d_neltos},()=>({active:false}));sim.poc.internal_states.l3d_frame="0".repeat(sim.poc.internal_states.l3d_neltos);var L3DSR_ID=8448;var L3DCR_ID=8452;var L3DDR_ID=8456;sim.poc.internal_states.io_hash[L3DSR_ID]="L3DSR";sim.poc.internal_states.io_hash[L3DCR_ID]="L3DCR";sim.poc.internal_states.io_hash[L3DDR_ID]="L3DDR";sim.poc.states.L3DSR={name:"L3DSR",verbal:"L3D State Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.L3DCR={name:"L3DCR",verbal:"L3D Control Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.states.L3DDR={name:"L3DDR",verbal:"L3D Data Register",visible:false,nbits:"32",value:0,default_value:0,draw_data:[]};sim.poc.signals.L3D_IOR={name:"L3D_IOR",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","L3D_IOR BUS_AB BUS_DB L3DSR L3DCR L3DDR CLK; FIRE M1"],fire_name:["svg_p:tspan4173"],draw_data:[[],["svg_p:path3795","svg_p:path3733"]],draw_name:[[],[]]};sim.poc.signals.L3D_IOW={name:"L3D_IOW",visible:true,type:"L",value:0,default_value:0,nbits:"1",behavior:["NOP","L3D_IOW BUS_AB BUS_DB L3DSR L3DCR L3DDR CLK; FIRE M1; L3D_SYNC"],fire_name:["svg_p:text3785-0-6-0-5-5"],draw_data:[[],["svg_p:path3805","svg_p:path3733"]],draw_name:[[],[]]};sim.poc.behaviors.L3D_IOR={nparameters:7,types:["E","E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.poc.states[s_expr[1]]);var iosr=get_value(sim.poc.states[s_expr[3]]);var iocr=get_value(sim.poc.states[s_expr[4]]);var iodr=get_value(sim.poc.states[s_expr[5]]);if(bus_ab==L3DCR_ID){set_value(sim.poc.states[s_expr[2]],iocr)}if(bus_ab==L3DDR_ID){set_value(sim.poc.states[s_expr[2]],iodr)}if(bus_ab==L3DCR_ID){var x=(iodr&4278190080)>>24;var y=(iodr&16711680)>>16;var z=(iodr&65280)>>8;var p=z*Math.pow(sim.poc.internal_states.l3d_dim,2)+y*sim.poc.internal_states.l3d_dim+x;var s=get_var(sim.poc.internal_states.l3d_state[p].active);set_value(sim.poc.states[s_expr[2]],s)}},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.poc.states[s_expr[1]]);var iosr=get_value(sim.poc.states[s_expr[3]]);var iocr=get_value(sim.poc.states[s_expr[4]]);var iodr=get_value(sim.poc.states[s_expr[5]]);if(bus_ab==L3DSR_ID)verbal="I/O device read at L3DSR of value "+iosr+". ";if(bus_ab==L3DCR_ID)verbal="I/O device read at L3DCR of value "+iocr+". ";if(bus_ab==L3DDR_ID)verbal="I/O device read at L3DDR of value "+iodr+". ";return verbal}};sim.poc.behaviors.L3D_IOW={nparameters:7,types:["E","E","E","E","E","E"],operation:function(s_expr){var bus_ab=get_value(sim.poc.states[s_expr[1]]);var bus_db=get_value(sim.poc.states[s_expr[2]]);if(bus_ab!=L3DSR_ID&&bus_ab!=L3DCR_ID&&bus_ab!=L3DDR_ID){return}if(bus_ab==L3DSR_ID){set_value(sim.poc.states[s_expr[3]],bus_db)}if(bus_ab==L3DDR_ID){set_value(sim.poc.states[s_expr[5]],bus_db)}if(bus_ab==L3DCR_ID){set_value(sim.poc.states[s_expr[4]],bus_db);var x=(bus_db&4278190080)>>24;var y=(bus_db&16711680)>>16;var z=(bus_db&65280)>>8;var p=z*Math.pow(sim.poc.internal_states.l3d_dim,2)+y*sim.poc.internal_states.l3d_dim+x;var s=(bus_db&255)!=0;var l3dstates=sim.poc.internal_states.l3d_state;set_var(l3dstates[p].active,s)}},verbal:function(s_expr){var verbal="";var bus_ab=get_value(sim.poc.states[s_expr[1]]);var bus_db=get_value(sim.poc.states[s_expr[2]]);if(bus_ab==L3DSR_ID)verbal="I/O device write at L3DSR with value "+bus_db+". ";if(bus_ab==L3DCR_ID)verbal="I/O device write at L3DCR with value "+bus_db+". ";if(bus_ab==L3DDR_ID)verbal="I/O device write at L3DDR with value "+bus_db+". ";return verbal}};sim.poc.behaviors.L3D_RESET={nparameters:1,operation:function(s_expr){sim.poc.events.l3d={};for(var i=0;i<sim.poc.internal_states.l3d_state.length;i++){set_var(sim.poc.internal_states.l3d_state[i].active,false)}var o="0".repeat(64);sim.poc.internal_states.l3d_frame=o;simcore_rest_call("L3D","POST","/",{frame:o})},verbal:function(s_expr){return"Reset the I/O device. "}};sim.poc.behaviors.L3D_SYNC={nparameters:1,operation:function(s_expr){var l3dstates=sim.poc.internal_states.l3d_state;var o="";var p=0;for(var i=0;i<4;i++){for(var j=0;j<4;j++){for(var k=0;k<4;k++){p=k*Math.pow(sim.poc.internal_states.l3d_dim,2)+j*sim.poc.internal_states.l3d_dim+i;if(get_var(l3dstates[p].active))o=o+"1";else o=o+"0"}}}if(sim.poc.internal_states.l3d_frame!=o){sim.poc.internal_states.l3d_frame=o;simcore_rest_call("L3D","POST","/",{frame:o})}},verbal:function(s_expr){return"Sync State with Device. "}};function nextToken(context){var tok="";var first="";var last="";var token_type="";while("# \t\n\r".indexOf(context.text[context.t])!=-1&&context.t<context.text.length){if(context.text[context.t]=="#"){first=context.t+1;while("\n".indexOf(context.text[context.t])==-1&&context.t<context.text.length){context.t++}last=context.t;tok=context.text.substring(first,last);tok=tok.trim();context.comments.push(tok)}if(context.text[context.t]=="\n"){context.line++;context.newlines.push(context.t)}context.t++}if("{},()=:".indexOf(context.text[context.t])!=-1&&context.t<context.text.length){tok=context.text[context.t];context.t++;context.tokens.push(tok);context.token_types.push("TOKEN");context.i=context.tokens.length-1;return context}if('"'==context.text[context.t]){first=context.t;context.t++;while('"'.indexOf(context.text[context.t])==-1&&context.t<context.text.length){if("\\".indexOf(context.text[context.t])!=-1)context.t++;context.t++}context.t++;last=context.t;token_type="STRING"}else if("'"==context.text[context.t]){first=context.t;context.t++;while("'".indexOf(context.text[context.t])==-1&&context.t<context.text.length){if("\\".indexOf(context.text[context.t])!=-1)context.t++;context.t++}context.t++;last=context.t;token_type="STRING"}else{first=context.t;while("{},()=:# \t\n\r".indexOf(context.text[context.t])==-1&&context.t<context.text.length){context.t++}last=context.t;token_type="TOKEN"}var tmp_context=context.t;while("# \t\n\r".indexOf(context.text[tmp_context])!=-1&&tmp_context<context.text.length){if(context.text[tmp_context]=="#"){while("\n".indexOf(context.text[tmp_context])==-1&&tmp_context<context.text.length){tmp_context++}}tmp_context++}if(":"==context.text[tmp_context]){token_type="TAG";context.t=tmp_context+1}tok=context.text.substring(first,last);tok=tok.trim();if("TAG"==token_type)tok=tok+":";context.tokens.push(tok);context.token_types.push(token_type);context.i=context.tokens.length-1;return context}function getToken(context){return context.tokens[context.i]}function getTokenType(context){return context.token_types[context.i]}function isToken(context,text){return getToken(context)==text.trim()}function langError(context,msgError){var line2=0;if(context.newlines.length>0)line2=context.newlines[context.newlines.length-1]+1;var line1=0;if(context.newlines.length>1)line1=context.newlines[context.newlines.length-2]+1;var lowI=line1;var highI=Math.min(context.t-1,line2+32);for(;typeof context.text[highI+1]!="undefined"&&context.text[highI+1]!="\n";highI++);var line3=highI+2;highI++;for(;typeof context.text[highI+1]!="undefined"&&context.text[highI+1]!="\n";highI++);highI++;context.error="<pre style='background-color: inherit !important'>...\n";for(var i=lowI;i<highI;i++){if(i==line1)context.error+=" "+(context.line-1)+"\t";if(i==line2)context.error+="*"+context.line+"\t";if(i==line3)context.error+=" "+(context.line+1)+"\t";if(typeof context.text[i]!="undefined")context.error+=context.text[i];else context.error+="&lt;EOF&gt;"}context.error+="\n...\n</pre>"+"(*) Problem around line "+context.line+":<br>"+msgError+".<br>";if(typeof ga!=="undefined")ga("send","event","compile","compile.error","compile.error."+msgError);return context}function getLabelContext(context){return{t:context.t,line:context.line,newlines:context.newlines.slice()}}function setLabelContext(context,labelContext){context.t=labelContext.t;context.line=labelContext.line;context.newlines=labelContext.newlines}function getComments(context){return context.comments.join("\n")}function resetComments(context){context.comments=[]}function nextNative(context){var first=context.t;var last=context.t;var braces=1;while(context.t<context.text.length&&braces!=0){if("{"==context.text[context.t])braces++;if("}"==context.text[context.t])braces--;context.t++}last=context.t-1;var tok=context.text.substring(first,last);context.tokens.push(tok);context.token_types.push("NATIVE");context.i=context.tokens.length-1;return context}function read_microprg(context){var microprograma=[];var microcomments=[];resetComments(context);if(!isToken(context,"{"))return langError(context,"Expected '{' not found");nextToken(context);while(!isToken(context,"}")){var microInstruccionAux={};if(!isToken(context,"(")){var newLabelName=getToken(context);newLabelName=newLabelName.substring(0,newLabelName.length-1);if("TAG"!=getTokenType(context))return langError(context,"Expected '<label>:' not found but '"+newLabelName+"'.");for(var contadorMCAux in context.etiquetas){if(context.etiquetas[contadorMCAux]==newLabelName)return langError(context,"Label is repeated: "+getToken(context))}context.etiquetas[context.contadorMC]=newLabelName;if(newLabelName.match("[a-zA-Z_0-9]*")[0]!=newLabelName)return langError(context,"Label format is not valid for '"+getToken(context)+"'");nextToken(context)}if(!isToken(context,"("))return langError(context,"Expected '(' not found");nextToken(context);while(!isToken(context,")")){var nombre_tok=getToken(context).toUpperCase();if(nombre_tok=="MADDR"){nextToken(context);if(!isToken(context,"="))return langError(context,"Expected '=' not found");nextToken(context);var labelsNotFoundAux={};labelsNotFoundAux.nombre=getToken(context);labelsNotFoundAux.cycle=microprograma.length;labelsNotFoundAux.index=context.i;labelsNotFoundAux.instruction=context.instrucciones.length;var etiquetaFounded=0;for(var k in context.etiquetas){if(isToken(context,context.etiquetas[k])){microInstruccionAux[nombre_tok]=k.toString();etiquetaFounded=1}}if(etiquetaFounded==0){context.labelsNotFound.push(labelsNotFoundAux)}nextToken(context);if(isToken(context,","))nextToken(context);continue}if(typeof simhw_sim_signal(nombre_tok)=="undefined")return langError(context,"Signal does not exists: '"+nombre_tok+"'");if(typeof simhw_sim_signal(nombre_tok).forbidden!="undefined")return langError(context,"Signal '"+nombre_tok+"' cannot be used directly, please use the Control Unit signals instead.");microInstruccionAux[nombre_tok]=1;nextToken(context);if(isToken(context,"=")){nextToken(context);microInstruccionAux[nombre_tok]=parseInt(getToken(context),2);if(getToken(context).match("[01]*")[0]!=getToken(context))return langError(context,"Incorrect binary format: "+getToken(context));if(microInstruccionAux[nombre_tok]>=Math.pow(2,simhw_sim_signal(nombre_tok).nbits))return langError(context,"Value out of range: "+getToken(context));nextToken(context)}if(isToken(context,","))nextToken(context)}var acc_cmt=getComments(context);microcomments.push(acc_cmt);resetComments(context);microprograma.push(microInstruccionAux);context.contadorMC++;nextToken(context);if(isToken(context,","))nextToken(context)}if(microprograma.length===0)return langError(context,"Empty microcode");nextToken(context);return{microprograma:microprograma,microcomments:microcomments}}function read_native(context){var microprograma=[];var microcomments=[];if(!isToken(context,"{"))return langError(context,"Expected '{' not found");nextNative(context);var microInstruccionAux={};microInstruccionAux.NATIVE=getToken(context);microprograma.push(microInstruccionAux);microcomments.push("");nextToken(context);return{microprograma:microprograma,microcomments:microcomments}}function find_first_cocop(context,curr_instruction,first_co,last_co){var k=0;var m=0;var ret={};ret.label_co="";ret.label_cop="";var cop_overlaps=false;for(m=0;m<curr_instruction.fields.length;m++){if(curr_instruction.fields[m].stopbit==="0"){cop_overlaps=true;break}}for(j=first_co;j<last_co;j++){ret.label_co=j.toString(2).padStart(6,"0");if(typeof context.co_cop[ret.label_co]==="undefined"){context.co_cop[ret.label_co]={};context.co_cop[ret.label_co].withcop=false;return ret}if(typeof curr_instruction.cop!=="undefined"){if(typeof context.co_cop[ret.label_co].cop[curr_instruction.cop]!=="undefined"){continue}ret.label_cop=curr_instruction.cop;return ret}if(cop_overlaps===true){continue}if(context.co_cop[ret.label_co].withcop===false){continue}first_cop=0;last_cop=Math.pow(2,4)-1;for(k=first_cop;k<last_cop;k++){ret.label_cop=k.toString(2).padStart(4,"0");if(context.co_cop[ret.label_co].cop===null||typeof context.co_cop[ret.label_co].cop==="undefined"){context.co_cop[ret.label_co].cop={};return ret}if(typeof context.co_cop[ret.label_co].cop[ret.label_cop]==="undefined"){return ret}}}return ret}function loadFirmware(text){var ret={};var xr_info=simhw_sim_ctrlStates_get();var all_ones_co="1".repeat(xr_info.ir.default_eltos.co.length);var context={};context.line=1;context.error=null;context.i=0;context.contadorMC=0;context.etiquetas={};context.labelsNotFound=[];context.instrucciones=[];context.co_cop={};context.registers=[];context.text=text;context.tokens=[];context.token_types=[];context.t=0;context.newlines=[];context.pseudoInstructions=[];context.stackRegister=null;context.comments=[];var i=0;nextToken(context);while(context.t<context.text.length){if(isToken(context,"registers")){nextToken(context);if(!isToken(context,"{"))return langError(context,"Expected '{' not found");nextToken(context);while(!isToken(context,"}")){var nombre_reg=getToken(context);nextToken(context);if(!isToken(context,"="))return langError(context,"Expected '=' not found");nextToken(context);context.registers[nombre_reg]=getToken(context);nextToken(context);if(isToken(context,"(")){if(context.stackRegister!=null)return langError(context,"Duplicate definition of stack pointer");nextToken(context);if(!isToken(context,"stack_pointer"))return langError(context,"Expected stack_pointer token not found");context.stackRegister=nombre_reg;nextToken(context);if(!isToken(context,")"))return langError(context,"Expected ')' not found");nextToken(context)}if(isToken(context,","))nextToken(context)}nextToken(context);continue}if(isToken(context,"pseudoinstructions")){nextToken(context);if(!isToken(context,"{"))return langError(context,"Expected '{' not found");nextToken(context);while(!isToken(context,"}")){var pseudoInstructionAux={};var pseudoInitial={};pseudoInitial.signature="";pseudoInitial.name="";pseudoInitial.fields=[];pseudoInitial.name=getToken(context);pseudoInitial.signature=pseudoInitial.signature+getToken(context)+",";nextToken(context);while(!isToken(context,"{")){var pseudoFieldAux={};pseudoFieldAux.name=getToken(context);nextToken(context);if(!isToken(context,"="))return langError(context,"Expected '=' not found (for name=type)");nextToken(context);pseudoFieldAux.type=getToken(context).replace("num","inm");switch(pseudoFieldAux.type){case"reg":case"inm":case"addr":case"address":break;default:return langError(context,"Invalid parameter '"+pseudoFieldAux.type+"'. It only allows the following fields: reg, num, inm, addr, address")}pseudoInitial.fields.push(pseudoFieldAux);pseudoInitial.signature=pseudoInitial.signature+getToken(context)+",";nextToken(context);if(isToken(context,","))nextToken(context)}nextToken(context);pseudoInitial.signature=pseudoInitial.signature.substr(0,pseudoInitial.signature.length-1).replace(/num/g,"inm");pseudoInstructionAux.initial=pseudoInitial;var contPseudoFinish=0;var pseudoFinishAux={};pseudoFinishAux.signature="";var inStart=0;var cont=false;while(!isToken(context,"}")){if(inStart==0){for(i=0;i<context.instrucciones.length;i++){if(context.instrucciones[i].name==getToken(context)){cont=true;break}}if(!cont)return langError(context,"Undefined instruction '"+getToken(context)+"'")}if(getToken(context)==";")inStart=0;else inStart++;pseudoFinishAux.signature=pseudoFinishAux.signature+getToken(context)+" ";nextToken(context)}pseudoInstructionAux.finish=pseudoFinishAux;pseudoInstructionAux.finish.signature=pseudoInstructionAux.finish.signature.replace(";","\n");context.pseudoInstructions.push(pseudoInstructionAux);nextToken(context)}nextToken(context);continue}if(isToken(context,"begin")){var instruccionAux={};instruccionAux.name=getToken(context);instruccionAux["mc-start"]=context.contadorMC;nextToken(context);if(isToken(context,","))nextToken(context);instruccionAux["native"]=false;if(isToken(context,"native")){instruccionAux["native"]=true;nextToken(context);if(isToken(context,","))nextToken(context);context.etiquetas[context.contadorMC]="fetch"}ret={};if(true==instruccionAux["native"])ret=read_native(context);else ret=read_microprg(context);if(typeof ret.error!="undefined")return ret;instruccionAux.signature="begin";instruccionAux.signatureGlobal="begin";instruccionAux.signatureUser="begin";instruccionAux.signatureRaw="begin";instruccionAux.microcode=ret.microprograma;instruccionAux.microcomments=ret.microcomments;context.instrucciones.push(instruccionAux);context.contadorMC=context.contadorMC+9;continue}var instruccionAux={};instruccionAux.name=getToken(context);instruccionAux["mc-start"]=context.contadorMC;var re_name="[a-zA-Z_0-9.]*";if(instruccionAux.name.match(re_name)[0]!=instruccionAux.name)return langError(context,"Instruction name '"+instruccionAux.name+"' is not valid for "+re_name);var firma="";var firmaGlobal="";var firmaUsuario="";var numeroCampos=0;var campos=[];firma=getToken(context)+",";firmaUsuario=getToken(context)+" ";nextToken(context);while(isToken(context,","))nextToken(context);while(!isToken(context,"{")){while(isToken(context,","))nextToken(context);var plus_found=false;if(!isToken(context,",")&&!isToken(context,"(")&&!isToken(context,")")){var campoAux={};var auxValue=getToken(context);if(auxValue[auxValue.length-1]=="+"){auxValue=auxValue.substring(0,auxValue.length-1);plus_found=true}campoAux.name=auxValue;campos.push(campoAux);numeroCampos++;firma=firma+auxValue;firmaUsuario=firmaUsuario+auxValue;nextToken(context);if(numeroCampos>100)return langError(context,"more than 100 fields in a single instruction.");if(auxValue=="co")return langError(context,"instruction field has 'co' as name.");if(auxValue=="nwords")return langError(context,"instruction field has 'nwords' as name.")}if(isToken(context,"(")){firma=firma+",(";if(plus_found)firmaUsuario=firmaUsuario+"+(";else firmaUsuario=firmaUsuario+" (";nextToken(context);if(!isToken(context,",")&&!isToken(context,"(")&&!isToken(context,")")){var campoAux={};campoAux.name=getToken(context);campos.push(campoAux);numeroCampos++;firma=firma+getToken(context);firmaUsuario=firmaUsuario+getToken(context);nextToken(context)}else{return langError(context,"'token' is missing after '(' on: "+context.co_cop[instruccionAux.co].signature)}if(isToken(context,")")){firma=firma+")";firmaUsuario=firmaUsuario+")";nextToken(context)}else{return langError(context,"')' is missing on: "+context.co_cop[instruccionAux.co].signature)}}firma=firma+",";firmaUsuario=firmaUsuario+" "}firma=firma.substr(0,firma.length-1);firma=firma.replace(/,,/g,",");firmaUsuario=firmaUsuario.substr(0,firmaUsuario.length-1);firmaUsuario=firmaUsuario.replace(/  /g," ");instruccionAux.signature=firma;instruccionAux.signatureGlobal=firma;instruccionAux.signatureUser=firmaUsuario;instruccionAux.signatureRaw=firmaUsuario;nextToken(context);if(!isToken(context,"co"))return langError(context,"Expected keyword 'co' not found");nextToken(context);if(!isToken(context,"="))return langError(context,"Expected '=' not found");nextToken(context);instruccionAux.co=getToken(context);if(getToken(context).match("[01]*")[0]!=getToken(context)||getToken(context).length!==xr_info.ir.default_eltos.co.length){return langError(context,"Incorrect binary format on 'co': "+getToken(context))}if(instruccionAux.co!=all_ones_co){if(typeof context.co_cop[instruccionAux.co]!=="undefined"&&context.co_cop[instruccionAux.co].cop===null){return langError(context,"'co' is already been used by: "+context.co_cop[instruccionAux.co].signature)}if(typeof context.co_cop[instruccionAux.co]=="undefined"){context.co_cop[instruccionAux.co]={};context.co_cop[instruccionAux.co].signature=instruccionAux.signature;context.co_cop[instruccionAux.co].cop=null}}nextToken(context);if(isToken(context,","))nextToken(context);if(isToken(context,"cop")){nextToken(context);if(!isToken(context,"=")){return langError(context,"Expected '=' not found")}nextToken(context);instruccionAux.cop=getToken(context);if(getToken(context).match("[01]*")[0]!=getToken(context)){return langError(context,"Incorrect binary format on 'cop': "+getToken(context))}if(context.co_cop[instruccionAux.co].cop!=null&&typeof context.co_cop[instruccionAux.co].cop[instruccionAux.cop]!="undefined"){return langError(context,"'co+cop' is already been used by: "+context.co_cop[instruccionAux.co].cop[instruccionAux.cop])}if(context.co_cop[instruccionAux.co].cop==null)context.co_cop[instruccionAux.co].cop={};context.co_cop[instruccionAux.co].cop[instruccionAux.cop]=instruccionAux.signature;nextToken(context);if(isToken(context,",")){nextToken(context)}}if(!isToken(context,"nwords"))return langError(context,"Expected keyword 'nwords' not found");nextToken(context);if(!isToken(context,"="))return langError(context,"Expected '=' not found");nextToken(context);instruccionAux.nwords=getToken(context);nextToken(context);if(isToken(context,","))nextToken(context);var camposInsertados=0;var overlapping={};while(camposInsertados<numeroCampos){var tmp_name=getToken(context);if(campos[camposInsertados].name!=tmp_name)return langError(context,"Unexpected field found: '"+tmp_name+"'");nextToken(context);if(!isToken(context,"="))return langError(context,"Expected '=' not found");nextToken(context);if(!isToken(context,"reg")&&!isToken(context,"inm")&&!isToken(context,"address"))return langError(context,"Incorrect type of field (reg, inm or address)");campos[camposInsertados].type=getToken(context);firma=firma.replace(","+campos[camposInsertados].name,","+campos[camposInsertados].type);firma=firma.replace("("+campos[camposInsertados].name,"("+campos[camposInsertados].type);firma=firma.replace(")"+campos[camposInsertados].name,")"+campos[camposInsertados].type);firmaUsuario=firmaUsuario.replace(campos[camposInsertados].name,campos[camposInsertados].type);instruccionAux.signature=firma;instruccionAux.signatureUser=firmaUsuario;firmaGlobal=firma.replace("address","num");firmaGlobal=firmaGlobal.replace("inm","num");instruccionAux.signatureGlobal=firmaGlobal;nextToken(context);if(!isToken(context,"("))return langError(context,"Expected '(' not found");nextToken(context);campos[camposInsertados].startbit=getToken(context);var start=parseInt(campos[camposInsertados].startbit);if(start>32*parseInt(instruccionAux.nwords)-1)return langError(context,"startbit out of range: "+getToken(context));nextToken(context);if(!isToken(context,","))return langError(context,"Expected ',' not found");nextToken(context);campos[camposInsertados].stopbit=getToken(context);var stop=parseInt(campos[camposInsertados].stopbit);if(stop>32*parseInt(instruccionAux.nwords))return langError(context,"stopbit out of range: "+getToken(context));for(i=stop;i<=start;i++){if(typeof overlapping[i]!="undefined")return langError(context,"overlapping field: "+campos[camposInsertados].name);overlapping[i]=1}nextToken(context);if(!isToken(context,")"))return langError(context,"Expected ')' not found");nextToken(context);if(campos[camposInsertados].type=="address"){if(getToken(context)!="abs"&&getToken(context)!="rel")return langError(context,"Type of addressing incorrect (abs or rel)");campos[camposInsertados].address_type=getToken(context);nextToken(context)}if(isToken(context,","))nextToken(context);camposInsertados++}instruccionAux.fields=campos;instruccionAux["native"]=false;if(isToken(context,"native")){instruccionAux["native"]=true;nextToken(context);if(isToken(context,","))nextToken(context)}if(instruccionAux["native"]===false&&typeof instruccionAux.cop!=="undefined"&&instruccionAux.cop.length!==xr_info.ir.default_eltos.cop.length){return langError(context,"Incorrect binary length for 'cop': "+getToken(context))}ret={};if(true==instruccionAux["native"])ret=read_native(context);else ret=read_microprg(context);if(typeof ret.error!="undefined")return ret;instruccionAux.microcode=ret.microprograma;instruccionAux.microcomments=ret.microcomments;context.instrucciones.push(instruccionAux);context.contadorMC=context.contadorMC+9;if(!isToken(context,"}"))return langError(context,"Expected '}' not found");nextToken(context)}if(context.stackRegister==null)return langError(context,"Stack pointer register was not defined");var found=false;for(i=0;i<context.instrucciones.length;i++){if(context.instrucciones[i].name=="begin"){for(var j=0;j<context.instrucciones[i].microcode.length;j++){if(typeof context.etiquetas[j]!="undefined"&&context.etiquetas[j]=="fetch"){found=true}}if(found===false)return langError(context,"label 'fetch' not defined")}}if(found===false){return langError(context,"'begin' not found")}var first_co=0;var last_co=Math.pow(2,6)-1;var curr_instruction=null;for(i=0;i<context.instrucciones.length;i++){curr_instruction=context.instrucciones[i];if(curr_instruction.name==="begin"||curr_instruction.co!=="111111"){continue}var r=find_first_cocop(context,curr_instruction,first_co,last_co);if(r.j>=last_co){return langError(context,"There is not enough 'co' codes available for instructions")}first_co=parseInt(r.label_co,2);curr_instruction.co=r.label_co;context.co_cop[r.label_co].signature=curr_instruction.signature;if(r.label_cop!==""){curr_instruction.cop=r.label_cop;context.co_cop[r.label_co].cop[r.label_cop]=curr_instruction.signature;context.co_cop[r.label_co].withcop=true}}var labelsFounded=0;if(context.labelsNotFound.length>0){for(i=0;i<context.labelsNotFound.length;i++){for(var j in context.etiquetas){if(context.etiquetas[j]==context.labelsNotFound[i].nombre){context.instrucciones[context.labelsNotFound[i].instruction].microcode[context.labelsNotFound[i].cycle].MADDR=j;labelsFounded++}}if(labelsFounded==0){return langError(context,"MADDR label not found : "+context.labelsNotFound[i].nombre)}labelsFounded=0}}var mk_native="";for(i=0;i<context.instrucciones.length;i++){var ins=context.instrucciones[i];if(false==ins["native"]){continue}for(var j=0;j<ins.microcode.length;j++){if(typeof ins.microcode[j].NATIVE!="undefined"){mk_native+="context.instrucciones["+i+']["microcode"]['+j+']["NATIVE_JIT"] = '+" function() {\n"+'\t var fields = simcore_native_get_fields("'+ins.signatureRaw+'");\n'+ins.microcode[j].NATIVE+"\n};\n "}}}eval(mk_native);var fico=0;var ficop=0;context.cocop_hash={};for(var fi in context.instrucciones){if(context.instrucciones[fi].name=="begin"){continue}fico=context.instrucciones[fi].co;if(typeof context.cocop_hash[fico]=="undefined"){context.cocop_hash[fico]={}}if(typeof context.instrucciones[fi].cop=="undefined"){context.cocop_hash[fico].withcop=false;context.cocop_hash[fico].i=context.instrucciones[fi]}else{ficop=context.instrucciones[fi].cop;context.cocop_hash[fico].withcop=true;context.cocop_hash[fico][ficop]=context.instrucciones[fi]}}ret={};ret.error=null;ret.firmware=context.instrucciones;ret.labels_firm=context.etiquetas;ret.mp={};ret.seg={};ret.registers=context.registers;ret.pseudoInstructions=context.pseudoInstructions;ret.stackRegister=context.stackRegister;ret.cocop_hash=context.cocop_hash;return ret}function saveFirmware(SIMWARE){var file="";for(i=0;i<SIMWARE.firmware.length;i++){file+=SIMWARE.firmware[i].signatureRaw;file+=" {"+"\n";if(typeof SIMWARE.firmware[i].co!="undefined"){file+="\t"+"co="+SIMWARE.firmware[i].co+","+"\n"}if(typeof SIMWARE.firmware[i].cop!="undefined"){file+="\t"+"cop="+SIMWARE.firmware[i].cop+","+"\n"}if(typeof SIMWARE.firmware[i].nwords!="undefined"){file+="\t"+"nwords="+SIMWARE.firmware[i].nwords+","+"\n"}if(typeof SIMWARE.firmware[i].fields!="undefined"){if(SIMWARE.firmware[i].fields.length>0){for(var j=0;j<SIMWARE.firmware[i].fields.length;j++){file+="\t"+SIMWARE.firmware[i].fields[j].name+" = "+SIMWARE.firmware[i].fields[j].type;file+="("+SIMWARE.firmware[i].fields[j].startbit+","+SIMWARE.firmware[i].fields[j].stopbit+")";if(SIMWARE.firmware[i].fields[j].type=="address"){file+=SIMWARE.firmware[i].fields[j].address_type}file+=","+"\n"}}}if(typeof SIMWARE.firmware[i].microcode!="undefined"){var addr=SIMWARE.firmware[i]["mc-start"];if(SIMWARE.firmware[i].name!="begin"){file+="\t"+"{"}for(var j=0;j<SIMWARE.firmware[i].microcode.length;j++){if(""!=SIMWARE.firmware[i].microcomments[j])file+="\n\t\t# "+SIMWARE.firmware[i].microcomments[j];if(typeof SIMWARE.labels_firm[addr]!="undefined")file+="\n"+SIMWARE.labels_firm[addr]+":\t";else file+="\n"+"\t"+"\t";file+="(";var anySignal=0;for(var k in SIMWARE.firmware[i].microcode[j]){if("MADDR"==k){var val=SIMWARE.firmware[i].microcode[j][k];if(typeof SIMWARE.labels_firm[val]=="undefined")file+=k+"="+val.toString(2)+", ";else file+=k+"="+SIMWARE.labels_firm[val]+", ";continue}file+=k+"="+SIMWARE.firmware[i].microcode[j][k].toString(2)+", ";anySignal=1}if(anySignal==1){file=file.substr(0,file.length-2)}file+="),";addr++}file=file.substr(0,file.length-1);if(SIMWARE.firmware[i].name!="begin"){file+="\n\t}"}}file+="\n}\n\n"}if(typeof SIMWARE.registers!="undefined"&&SIMWARE.registers.length>0){file+="registers"+"\n{\n";for(i=0;i<SIMWARE.registers.length;i++){if(SIMWARE.stackRegister==i)file+="\t"+i+"="+SIMWARE.registers[i]+" (stack_pointer),"+"\n";else file+="\t"+i+"="+SIMWARE.registers[i]+","+"\n"}file=file.substr(0,file.length-2);file+="\n}\n"}if(SIMWARE.pseudoInstructions.length!==0){file+="\n"+"pseudoinstructions\n"+"{";for(var ie=0;ie<SIMWARE.pseudoInstructions.length;ie++){file+="\n"+"\t"+SIMWARE.pseudoInstructions[ie].initial.signature.replace(","," ")+"\n"+"\t{\n";var ie_inst=SIMWARE.pseudoInstructions[ie].finish.signature.split("\n");for(var ie_i=0;ie_i<ie_inst.length;ie_i++){file+="\t\t"+ie_inst[ie_i].trim()+" ;\n"}file+="\t}\n"}file+="}\n"}return file}function decode_instruction(curr_firm,ep_ir,binstruction){var ret={oinstruction:null,op_code:0,cop_code:0};var bits=binstruction.toString(2).padStart(32,"0");var co=bits.substr(ep_ir.default_eltos.co.begin,ep_ir.default_eltos.co.length);ret.op_code=parseInt(co,2);var cop=bits.substr(ep_ir.default_eltos.cop.begin,ep_ir.default_eltos.cop.length);ret.cop_code=parseInt(cop,2);if("undefined"==typeof curr_firm.cocop_hash[co]){return ret}if(false==curr_firm.cocop_hash[co].withcop)ret.oinstruction=curr_firm.cocop_hash[co].i;else ret.oinstruction=curr_firm.cocop_hash[co][cop];return ret}function decode_ram(){var sram="\n";var curr_ircfg=simhw_sim_ctrlStates_get().ir;var curr_firm=simhw_internalState("FIRMWARE");var curr_MP=simhw_internalState("MP");for(var address in curr_MP){var binstruction=curr_MP[address].toString(2);binstruction="00000000000000000000000000000000".substring(0,32-binstruction.length)+binstruction;sram+="0x"+parseInt(address).toString(16)+":"+decode_instruction(curr_firm,curr_ircfg,binstruction).oinstruction+"\n"}return sram}BYTE_LENGTH=8;WORD_BYTES=4;WORD_LENGTH=WORD_BYTES*BYTE_LENGTH;directives={};directives[".kdata"]={name:".kdata",kindof:"segment",size:0};directives[".ktext"]={name:".ktext",kindof:"segment",size:0};directives[".data"]={name:".data",kindof:"segment",size:0};directives[".text"]={name:".text",kindof:"segment",size:0};directives[".byte"]={name:".byte",kindof:"datatype",size:1};directives[".half"]={name:".half",kindof:"datatype",size:2};directives[".word"]={name:".word",kindof:"datatype",size:4};directives[".space"]={name:".space",kindof:"datatype",size:1};directives[".ascii"]={name:".ascii",kindof:"datatype",size:1};directives[".asciiz"]={name:".asciiz",kindof:"datatype",size:1};directives[".align"]={name:".align",kindof:"datatype",size:0};sim_segments={".kdata":{name:".kdata",begin:0,end:255,color:"#FF99CC",kindof:"data"},".ktext":{name:".ktext",begin:256,end:4095,color:"#A9D0F5",kindof:"text"},".data":{name:".data",begin:4096,end:32767,color:"#FACC2E",kindof:"data"},".text":{name:".text",begin:32768,end:131071,color:"#BEF781",kindof:"text"},".stack":{name:".stack",begin:131071,end:1048575,color:"#F1F2A3",kindof:"stack"}};function get_datatype_size(datatype){if(typeof directives[datatype]==="undefined"){console.log("data type: "+datatype+" is not defined!!!\n");return 0}return directives[datatype].size}function isTokenKindOf(text,kindof){if(typeof directives[text]==="undefined"){return false}return directives[text].kindof==kindof}function is_directive(text){return typeof directives[text]!=="undefined"}function is_directive_segment(text){return isTokenKindOf(text,"segment")}function is_directive_datatype(text){return isTokenKindOf(text,"datatype")}function isDecimal(n){if(n.length>1&&n[0]=="0")return false;if(!isNaN(parseFloat(n))&&isFinite(n)){var res=parseInt(n);if(typeof n==="string"&&n.includes(".")){ws_alert("Truncating conversion has occurred: "+n+" became "+res)}return res}return false}function isOctal(n){if(n.substring(0,1)=="0"){var octal=n.substring(1).replace(/\b0+/g,"");var aux=parseInt(octal,8);return aux.toString(8)===octal?aux:false}return false}function isHex(n){if(n.substring(0,2).toLowerCase()=="0x"){var hex=n.substring(2).toLowerCase().replace(/\b0+/g,"");if(hex=="")hex="0";var aux=parseInt(hex,16);return aux.toString(16)===hex?aux:false}return false}function isChar(n){var ret1=treatControlSequences(n);if(true==ret1.error)return false;var possible_value=ret1.string;if(possible_value[0]=="'"&&possible_value[2]=="'")return possible_value.charCodeAt(1);return false}function decimal2binary(number,size){var num_bits=number.toString(2);if(num_bits.length>WORD_LENGTH)return[num_bits,size-num_bits.length];num_bits=(number>>>0).toString(2);if(number>=0)return[num_bits,size-num_bits.length];num_bits="1"+num_bits.replace(/^[1]+/g,"");if(num_bits.length>size)return[num_bits,size-num_bits.length];num_bits="1".repeat(size-num_bits.length)+num_bits;return[num_bits,size-num_bits.length]}function isValidTag(tag){if(!(isDecimal(tag[0])===false))return false;var myRegEx=/[^a-z,_\d]/i;return!myRegEx.test(tag)}function sum_array(a){return a.reduce((function(a,b){return a+b}),0)}function get_candidate(advance,instruction){var candidate=false;var candidates={};var signatures={};for(i=0;i<advance.length;i++){if(advance[i]){candidates[i]=instruction[i].nwords;signatures[instruction[i].signature]=0}}if(Object.keys(signatures).length===1){var min=false;for(var i in candidates){if(min==false){min=candidates[i];candidate=i}else if(min==candidates[i]){candidate=false}else if(min>candidates[i]){min=candidates[i];candidate=i}}}return candidate?parseInt(candidate):candidate}function reset_assembly(nwords){return"0".repeat(WORD_LENGTH*nwords)}function assembly_replacement(machineCode,num_bits,startbit,stopbit,free_space){var machineCodeAux=machineCode.substring(0,machineCode.length-startbit+free_space);machineCode=machineCodeAux+num_bits+machineCode.substring(machineCode.length-stopbit);return machineCode}function assembly_co_cop(machineCode,co,cop){var xr_info=simhw_sim_ctrlStates_get();if(co!==false)machineCode=assembly_replacement(machineCode,co,WORD_LENGTH,WORD_LENGTH-6,0);if(cop!==false)machineCode=assembly_replacement(machineCode,cop,xr_info.ir.default_eltos.cop.length,0,0);return machineCode}function writememory_and_reset(mp,gen,nwords){if(gen.byteWord>=WORD_BYTES){mp["0x"+gen.seg_ptr.toString(16)]=gen.machineCode;gen.seg_ptr=gen.seg_ptr+WORD_BYTES;gen.byteWord=0;gen.machineCode=reset_assembly(nwords)}}function is_end_of_file(context){return""===getToken(context)&&context.t>=context.text.length}function treatControlSequences(possible_value){var ret={};ret.string="";ret.error=false;for(var i=0;i<possible_value.length;i++){if("\\"!=possible_value[i]){ret.string=ret.string+possible_value[i];continue}i++;switch(possible_value[i]){case"b":ret.string=ret.string+"\b";break;case"f":ret.string=ret.string+"\f";break;case"n":ret.string=ret.string+"\n";break;case"r":ret.string=ret_string+"\r";break;case"t":ret.string=ret.string+"\t";break;case"v":ret.string=ret.string+"\v";break;case"a":ret.string=ret.string+String.fromCharCode(7);break;case"'":ret.string=ret.string+"'";break;case'"':ret.string=ret.string+'"';break;case"0":ret.string=ret.string+"\0";break;default:ret.string="Unknown escape char '\\"+possible_value[i]+"'";ret.error=true;return ret}}return ret}function read_data(context,datosCU,ret){var seg_name=getToken(context);var gen={};gen.byteWord=0;gen.machineCode=reset_assembly(1);gen.seg_ptr=ret.seg[seg_name].begin;nextToken(context);while(!is_directive_segment(getToken(context))&&!is_end_of_file(context)){var possible_tag="";while(!is_directive_datatype(getToken(context))&&!is_end_of_file(context)){possible_tag=getToken(context);if("TAG"!=getTokenType(context))return langError(context,"Expected tag or directive but found '"+possible_tag+"' instead");var tag=possible_tag.substring(0,possible_tag.length-1);if(!isValidTag(tag))return langError(context,"A tag must follow an alphanumeric format (starting with a letter or underscore) but found '"+tag+"' instead");if(context.firmware[tag])return langError(context,"A tag can not have the same name as an instruction ("+tag+")");if(ret.labels2[tag])return langError(context,"Repeated tag: '"+tag+"'");ret.labels2[tag]="0x"+(gen.seg_ptr+gen.byteWord).toString(16);nextToken(context)}if(is_end_of_file(context))break;var possible_datatype=getToken(context);if(".word"==possible_datatype||".half"==possible_datatype||".byte"==possible_datatype){nextToken(context);var possible_value=getToken(context);while(!is_directive(getToken(context))&&!is_end_of_file(context)){var number;var label_found=false;if((number=isOctal(possible_value))!==false);else if((number=isHex(possible_value))!==false);else if((number=isDecimal(possible_value))!==false);else if((number=isChar(possible_value))!==false);else{if(".word"==possible_datatype){if(!isValidTag(possible_value))return langError(context,"A tag must follow an alphanumeric format (starting with a letter or underscore) but found '"+possible_value+"' instead");if(context.firmware[possible_value])return langError(context,"A tag can not have the same name as an instruction ("+possible_value+")");number=0;label_found=true}else return langError(context,"Expected value for numeric datatype but found '"+possible_value+"' instead")}var size=get_datatype_size(possible_datatype);var a=decimal2binary(number,size*BYTE_LENGTH);num_bits=a[0];free_space=a[1];if(free_space<0)return langError(context,"Expected value that fits in a '"+possible_datatype+"' ("+size*BYTE_LENGTH+" bits), but inserted '"+possible_value+"' ("+num_bits.length+" bits) instead");writememory_and_reset(ret.mp,gen,1);while((gen.seg_ptr+gen.byteWord)%size!=0){gen.byteWord++;writememory_and_reset(ret.mp,gen,1)}if(""!=possible_tag){ret.labels2[possible_tag.substring(0,possible_tag.length-1)]="0x"+(gen.seg_ptr+gen.byteWord).toString(16);possible_tag=""}if(label_found)ret.labels["0x"+gen.seg_ptr.toString(16)]={name:possible_value,addr:gen.seg_ptr,startbit:31,stopbit:0,rel:undefined,nwords:1,labelContext:getLabelContext(context)};gen.machineCode=assembly_replacement(gen.machineCode,num_bits,BYTE_LENGTH*(size+gen.byteWord),BYTE_LENGTH*gen.byteWord,free_space);gen.byteWord+=size;nextToken(context);if(","==getToken(context))nextToken(context);if(is_directive(getToken(context))||"TAG"==getTokenType(context)||"."==getToken(context)[0])break;possible_value=getToken(context)}}else if(".space"==possible_datatype){nextToken(context);var possible_value=getToken(context);if(!isDecimal(possible_value))return langError(context,"Expected number of bytes to reserve in .space but found '"+possible_value+"' as number");if(possible_value<0)return langError(context,"Expected positive number but found '"+possible_value+"' as positive number");for(i=0;i<possible_value;i++){writememory_and_reset(ret.mp,gen,1);gen.byteWord++}nextToken(context)}else if(".align"==possible_datatype){nextToken(context);var possible_value=getToken(context);if(!isDecimal(possible_value)&&possible_value>=0)return langError(context,"Expected the align parameter as positive number but found '"+possible_value+"'. Remember that number is the power of two for alignment, see MIPS documentation..");writememory_and_reset(ret.mp,gen,1);var align_offset=Math.pow(2,parseInt(possible_value));switch(align_offset){case 1:break;case 2:if(gen.byteWord&1==1)gen.byteWord++;break;default:while(true){writememory_and_reset(ret.mp,gen,1);if(gen.seg_ptr%align_offset==0&&gen.byteWord==0)break;gen.byteWord++}}nextToken(context)}else if(".ascii"==possible_datatype||".asciiz"==possible_datatype){nextToken(context);var possible_value=getToken(context);var ret1=treatControlSequences(possible_value);if(true==ret1.error)return langError(context,ret1.string);possible_value=ret1.string;while(!is_directive(getToken(context))&&!is_end_of_file(context)){writememory_and_reset(ret.mp,gen,1);if(""==possible_value)return langError(context,"String is not closed (forgot to end it with quotation marks)");if("STRING"!=getTokenType(context))return langError(context,"Expected string between quotation marks but found '"+possible_value+"' instead");for(i=0;i<possible_value.length;i++){writememory_and_reset(ret.mp,gen,1);if(possible_value[i]=='"')continue;num_bits=possible_value.charCodeAt(i).toString(2);gen.machineCode=assembly_replacement(gen.machineCode,num_bits,BYTE_LENGTH*(1+gen.byteWord),BYTE_LENGTH*gen.byteWord,BYTE_LENGTH-num_bits.length);gen.byteWord++}if(".asciiz"==possible_datatype){writememory_and_reset(ret.mp,gen,1);num_bits="\0".charCodeAt(0).toString(2);gen.machineCode=assembly_replacement(gen.machineCode,num_bits,BYTE_LENGTH*(1+gen.byteWord),BYTE_LENGTH*gen.byteWord,BYTE_LENGTH-num_bits.length);gen.byteWord++}nextToken(context);if(","==getToken(context))nextToken(context);if(is_directive(getToken(context))||"TAG"==getTokenType(context)||"."==getToken(context)[0])break;possible_value=getToken(context);ret1=treatControlSequences(possible_value);if(true==ret1.error)return langError(context,ret1.string);possible_value=ret1.string}}else{return langError(context,"Unexpected datatype name '"+possible_datatype)}}if(gen.byteWord>0){ret.mp["0x"+gen.seg_ptr.toString(16)]=gen.machineCode;gen.seg_ptr=gen.seg_ptr+WORD_BYTES}ret.seg[seg_name].end=gen.seg_ptr}function read_text(context,datosCU,ret){var seg_name=getToken(context);var seg_ptr=ret.seg[seg_name].begin;var firmware=context.firmware;var pseudoInstructions=context.pseudoInstructions;var isPseudo=false;var counter=-1;var registers={};for(i=0;i<datosCU.registers.length;i++){var aux="$"+i;registers[aux]=i;registers[datosCU.registers[i]]=registers[aux]}nextToken(context);while(!is_directive_segment(getToken(context))&&!is_end_of_file(context)){while(!isPseudo&&typeof firmware[getToken(context)]==="undefined"&&!is_end_of_file(context)){var possible_tag=getToken(context);if("TAG"!=getTokenType(context))return langError(context,"Expected tag or instruction but found '"+possible_tag+"' instead");var tag=possible_tag.substring(0,possible_tag.length-1);if(!isValidTag(tag))return langError(context,"A tag must follow an alphanumeric format (starting with a letter or underscore) but found '"+tag+"' instead");if(firmware[tag])return langError(context,"A tag can not have the same name as an instruction ("+tag+")");if(ret.labels2[tag])return langError(context,"Repeated tag: '"+tag+"'");ret.labels2[tag]="0x"+seg_ptr.toString(16);nextToken(context)}if(is_end_of_file(context)){break}var instruction=null;if(!isPseudo){var finish=[];instruction=getToken(context)}else{instruction=finish[candidate][counter++]}var signature_fields=[];var signature_user_fields=[];var advance=[];var max_length=0;var binaryAux=[];var firmware_instruction_length=0;if(typeof firmware[instruction]!=="undefined"){firmware_instruction_length=firmware[instruction].length}for(i=0;i<firmware_instruction_length;i++){signature_fields[i]=firmware[instruction][i].signature.split(",");signature_user_fields[i]=firmware[instruction][i].signatureUser.split(" ");signature_fields[i].shift();signature_user_fields[i].shift();advance[i]=1;binaryAux[i]=[];max_length=Math.max(max_length,signature_fields[i].length);if(typeof pseudoInstructions[instruction]!=="function"&&pseudoInstructions[instruction]){finish[i]=firmware[instruction][i].finish.replace(/ ,/g,"").split(" ");finish[i].pop();isPseudo=true;var npseudoInstructions=0;var pseudo_fields={}}}var s=[];s[0]=instruction;for(i=0;i<max_length;i++){if(counter==-1){nextToken(context);if(","==getToken(context))nextToken(context);var value=getToken(context)}else{var aux_fields=finish[candidate][counter++];if(pseudo_fields[aux_fields])var value=pseudo_fields[aux_fields];else var value=aux_fields}var converted;if("TAG"!=getTokenType(context)&&!firmware[value])s[i+1]=value;for(j=0;j<advance.length;j++){if(advance[j]==0)continue;if(i>=signature_fields[j].length){if("TAG"!=getTokenType(context)&&!firmware[value])advance[j]=0;continue}var field=firmware[instruction][j].fields[i];var size=field.startbit-field.stopbit+1;var label_found=false;var sel_found=false;switch(field.type){case"address":case"inm":if(isPseudo&&"sel"==value){counter++;var start=finish[candidate][counter++];var stop=finish[candidate][counter++];var value=pseudo_fields[finish[candidate][counter++]];counter++;sel_found=true}if((converted=isOctal(value))!==false);else if((converted=isHex(value))!==false);else if((converted=isDecimal(value))!==false);else if((converted=isChar(value))!==false);else{var error="";if(value[0]=="'"){error="Unexpected inmediate value, found: '"+value+"' instead";advance[j]=0;break}if(!isValidTag(value)){error="A tag must follow an alphanumeric format (starting with a letter or underscore) but found '"+value+"' instead";advance[j]=0;break}if(firmware[value]){error="A tag can not have the same name as an instruction ("+value+")";advance[j]=0;break}label_found=true}if(sel_found){res=decimal2binary(converted,WORD_LENGTH);if(res[1]<0){return langError(context,"'"+value+"' is bigger than "+WORD_LENGTH+" bits")}converted="0".repeat(res[1])+res[0];converted=converted.substring(WORD_LENGTH-start-1,WORD_LENGTH-stop);converted=parseInt(converted,2);s[i+1]="0x"+converted.toString(16)}if(!label_found){var res=decimal2binary(converted,size);if(field.type=="address"&&"rel"==field.address_type)res=decimal2binary(converted-seg_ptr-WORD_BYTES,size)}break;case"reg":var aux=false;if(value.startsWith("(")){if("(reg)"!=signature_fields[j][i]){var error="Expected register but found register between parenthesis";advance[j]=0;break}if(counter==-1){nextToken(context);value=getToken(context)}else value=pseudo_fields[finish[candidate][counter++]];aux=true}else{if("(reg)"==signature_fields[j][i]){var error="Expected register between parenthesis but found '"+value+"' instead";advance[j]=0;break}}if(typeof registers[value]==="undefined"){var error="Expected register ($1, ...) but found '"+value+"' instead";advance[j]=0;break}if(aux){s[i+1]="("+value+")";if(counter==-1){nextToken(context);aux=getToken(context)}else aux=finish[candidate][counter++];if(")"!=aux){var error="String without end parenthesis ')'";advance[j]=0;break}}converted=isDecimal(registers[value]);var res=decimal2binary(converted,size);value=s[i+1];break;default:return langError(context,"An unknown error ocurred (1)")}if(advance[j]==1&&!label_found){if(res[1]<0){if(field.type=="address"&&"rel"==field.address_type)error="Relative value ("+(converted-seg_ptr-WORD_BYTES)+" in decimal) needs "+res[0].length+" bits in binary but there is space for only "+size+" bits";else var error="'"+value+"' needs "+res[0].length+" bits in binary but there is space for only "+size+" bits";advance[j]=0}}if(advance[j]==1&&!(isPseudo&&counter==-1)){binaryAux[j][i]={num_bits:label_found?false:res[0],free_space:label_found?false:res[1],startbit:field.startbit,stopbit:field.stopbit,rel:label_found?field.address_type:false,islabel:label_found,field_name:value}}}if(sum_array(advance)==0){break}if("TAG"==getTokenType(context)||firmware[value]){break}}var candidate;for(i=0;i<advance.length;i++){if(advance[i]==1){candidate=i;break}}var format="";for(i=0;i<firmware_instruction_length;i++){if(i>0&&i<firmware[instruction].length-1)format+=", ";if(i>0&&i==firmware[instruction].length-1)format+=" or ";format+="'"+firmware[instruction][i].signatureUser+"'"}var sum_res=sum_array(advance);if(sum_res==0){if(advance.length===1)return langError(context,error+". Remember that the instruction format has been defined as: "+format);return langError(context,"Instruction and fields don't match with microprogram. Remember that the instruction formats have been defined as: "+format+". Please check the microcode. Probably you forgot to add a field, a number does not fit in its space, or you just used a wrong instruction")}if(sum_res>1){candidate=get_candidate(advance,firmware[instruction]);if(candidate===false)return langError(context,"Instruction and fields match with more than one microprogram. Please check the microcode. Currently, the instruction format can be: "+format)}if(isPseudo){if(counter==-1){var s_ori=s.join(" ");s_ori=s_ori.trim();var key="";var val="";for(i=0;i<signature_fields[candidate].length;i++){key=firmware[instruction][candidate].fields[i].name;val=s[i+1];pseudo_fields[key]=val}counter++;continue}npseudoInstructions++;if(npseudoInstructions>1){s_ori="&nbsp;"}if(finish[candidate][counter]=="\n"){counter++}}var machineCode=reset_assembly(firmware[instruction][candidate].nwords);machineCode=assembly_co_cop(machineCode,firmware[instruction][candidate].co,firmware[instruction][candidate].cop);for(i=0;i<binaryAux[candidate].length;i++){if(binaryAux[candidate][i].islabel)ret.labels["0x"+seg_ptr.toString(16)]={name:binaryAux[candidate][i].field_name,addr:seg_ptr,startbit:binaryAux[candidate][i].startbit,stopbit:binaryAux[candidate][i].stopbit,rel:binaryAux[candidate][i].rel,nwords:firmware[instruction][candidate].nwords,labelContext:getLabelContext(context)};else{machineCode=assembly_replacement(machineCode,binaryAux[candidate][i].num_bits,binaryAux[candidate][i].startbit- -1,binaryAux[candidate][i].stopbit,binaryAux[candidate][i].free_space)}}s_def=s[0];for(i=0,j=1;i<signature_user_fields[candidate].length;i++,j++){switch(signature_user_fields[candidate][i]){case"address":case"inm":case"reg":case"(reg)":s_def=s_def+" "+s[j];break;default:s_def=s_def+" "+s[j]+s[j+1];j++}}if(!isPseudo){var s_ori=s_def}var ref=firmware[instruction][candidate];while(false===ref.isPseudoinstruction){var ref=datosCU.cocop_hash[firmware[instruction][candidate].co];if(ref.withcop)ref=ref[firmware[instruction][candidate].cop];else ref=ref.i}for(i=firmware[instruction][candidate].nwords-1;i>=0;i--){if(i<firmware[instruction][candidate].nwords-1){s_def=""}ret.assembly["0x"+seg_ptr.toString(16)]={breakpoint:false,binary:machineCode.substring(i*WORD_LENGTH,(i+1)*WORD_LENGTH),source:s_def,source_original:s_ori,firm_reference:ref};ret.mp["0x"+seg_ptr.toString(16)]=machineCode.substring(i*WORD_LENGTH,(i+1)*WORD_LENGTH);seg_ptr=seg_ptr+WORD_BYTES}if(!isPseudo&&max_length==signature_fields[candidate].length){nextToken(context)}if(isPseudo&&counter==finish[candidate].length){counter=-1;npseudoInstructions=0;isPseudo=false;nextToken(context)}if(context.t>context.text.length){break}}ret.seg[seg_name].end=seg_ptr}function simlang_compile(text,datosCU){var context={};context.line=1;context.error=null;context.i=0;context.contadorMC=0;context.etiquetas={};context.labelsNotFound=[];context.instrucciones=[];context.co_cop={};context.registers=[];context.text=text;context.tokens=[];context.token_types=[];context.t=0;context.newlines=[];context.pseudoInstructions=[];context.stackRegister=null;context.firmware={};context.comments=[];for(i=0;i<datosCU.firmware.length;i++){var aux=datosCU.firmware[i];if(typeof context.firmware[aux.name]==="undefined"){context.firmware[aux.name]=[]}context.firmware[aux.name].push({name:aux.name,nwords:parseInt(aux.nwords),co:typeof aux.co!=="undefined"?aux.co:false,cop:typeof aux.cop!=="undefined"?aux.cop:false,fields:typeof aux.fields!=="undefined"?aux.fields:false,signature:aux.signature,signatureUser:typeof aux.signatureUser!=="undefined"?aux.signatureUser:aux.name,isPseudoinstruction:false})}for(i=0;i<datosCU.pseudoInstructions.length;i++){var initial=datosCU.pseudoInstructions[i].initial;var finish=datosCU.pseudoInstructions[i].finish;if(typeof context.pseudoInstructions[initial.name]==="undefined"){context.pseudoInstructions[initial.name]=0;context.firmware[initial.name]=[]}context.pseudoInstructions[initial.name]++;context.firmware[initial.name].push({name:initial.name,fields:typeof initial.fields!=="undefined"?initial.fields:false,signature:initial.signature,signatureUser:initial.signature.replace(/,/g," "),finish:finish.signature,isPseudoinstruction:true})}var ret={};ret.seg=sim_segments;ret.mp={};ret.labels={};ret.labels2={};ret.assembly={};data_found=false;text_found=false;nextToken(context);while(!is_end_of_file(context)){var segname=getToken(context);if(typeof ret.seg[segname]==="undefined")return langError(context,"Expected .data/.text/... segment but found '"+segname+"' as segment");if("data"==ret.seg[segname].kindof){read_data(context,datosCU,ret);data_found=true}if("text"==ret.seg[segname].kindof){read_text(context,datosCU,ret);text_found=true}if(context.error!=null){ret.error=context.error;return ret}}for(i in ret.labels){var value=ret.labels2[ret.labels[i].name];if(typeof value==="undefined"){setLabelContext(context,ret.labels[i].labelContext);return langError(context,"Label '"+ret.labels[i].name+"' used but not defined in the assembly code")}var machineCode="";var auxAddr=ret.labels[i].addr;for(j=0;j<ret.labels[i].nwords;j++){machineCode=ret.mp["0x"+auxAddr.toString(16)]+machineCode;auxAddr+=WORD_BYTES}var size=ret.labels[i].startbit-ret.labels[i].stopbit+1;var converted;if((converted=isHex(value))!==false){var a=decimal2binary(converted,size);num_bits=a[0];free_space=a[1];var error="'"+ret.labels[i].name+"' needs "+num_bits.length+" bits in binary but there is space for only "+size+" bits";if("rel"==ret.labels[i].rel){var a=decimal2binary(converted-ret.labels[i].addr-WORD_BYTES,size);num_bits=a[0];free_space=a[1];error="Relative value ("+(converted-ret.labels[i].addr-WORD_BYTES)+" in decimal) needs "+num_bits.length+" bits in binary but there is space for only "+size+" bits"}}else return langError(context,"Unexpected error (2)");if(free_space<0){setLabelContext(context,ret.labels[i].labelContext);return langError(context,error)}machineCode=assembly_replacement(machineCode,num_bits,ret.labels[i].startbit- -1,ret.labels[i].stopbit,free_space);auxAddr=ret.labels[i].addr;for(j=ret.labels[i].nwords-1;j>=0;j--){ret.mp["0x"+auxAddr.toString(16)]=machineCode.substring(j*WORD_LENGTH,(j+1)*WORD_LENGTH);auxAddr+=WORD_BYTES}}if(text_found){if(typeof ret.labels2["main"]==="undefined"&&typeof ret.labels2["kmain"]==="undefined")return langError(context,"Tags 'main' or 'kmain' are not defined in the text segment(s). It is compulsory to define at least one of those tags in order to execute a program")}return ret}function simlang_native_adapt_replaceAssert(icode){var rc="";var re="";re=/assert\((.*)\)/;if(icode.search(re)!=-1){var match=re.exec(icode);try{var params=match[1].split(";");var p1=params[1].trim();rc="if ("+params[0]+") {\n"+"    set_screen_content("+p1+") ;\n"+"}\n";re=/assert\((.*)\)/g;icode=icode.replace(re,rc)}catch(e){console.log("Syntax error that cause a run-time error: "+e.toString());console.log(match)}}return icode}function simlang_native_adapt_replaceCheckStackLimit(icode){var rc="";var re="";re=/check_stack_limit\((.*)\)/;if(icode.search(re)!=-1){var match=re.exec(icode);try{var params=match[1].split(";");var p2=params[2].trim();rc="if (f_"+p2+" == simhw_sim_ctrlStates_get().sp.state) {\n"+"    if ("+p2+" < sim_segments.data.begin) {\n"+'        set_screen_content("Stack Overflow") ;\n'+"    }\n"+"    if ("+p2+" > sim_segments.data.end) {\n"+'        set_screen_content("Stack Underflow") ;\n'+"    }\n"+"}\n";re=/check_stack_limit\((.*)\)/g;icode=icode.replace(re,rc)}catch(e){console.log("Syntax error that cause a run-time error: "+e.toString());console.log(match)}}return icode}function simlang_native_adapt_replaceSyscall(icode){var rc="";var me="";var ff="print_char|print_int|print_float|print_double|print_string|"+"read_char|read_int|read_float|read_double|read_string|"+"sbrk|exit";var re=new RegExp("("+ff+")\\(([^)]*)\\)","g");var match=re.exec(icode);while(match!==null){var f=match[1].trim();var p=match[2].trim().split(",");switch(f){case"print_char":rc="// "+f+" \n"+"var tmp1 = 0x000000FF & "+p[0]+" ;\n"+"set_screen_content(tmp1.toString()) ;\n";break;case"print_int":rc="// "+f+" \n"+"set_screen_content("+p[0]+".toString()) ;\n";break;case"print_float":rc="// "+f+" \n"+"var tmp1 = hex2float("+p[0]+") ;\n"+"set_screen_content(tmp1.toString()) ;\n";break;case"print_double":rc="// "+f+" \n"+"var tmp1 = hex2float("+p[0]+") ;\n"+"set_screen_content(tmp1.toString()) ;\n";break;case"print_string":rc="// "+f+" \n"+'var tmp1 = "" ;\n'+'var tmp2 = simcore_native_get_value("MEMORY", '+p[0]+") ;\n"+"for (var k="+p[0]+"+1; (tmp2 !== 0) && (k<8*1024); k++) {\n"+"     tmp1 += tmp2.toString() ;\n"+'     tmp2  = simcore_native_get_value("MEMORY", k) ;\n'+"} ;\n"+"set_screen_content(tmp1) ;\n";break;case"read_char":rc="// "+f+" \n"+"var tmp1 = get_screen_content() ;\n"+"var "+p[0]+" = 0x000000FF & parseInt(tmp1) ;\n";break;case"read_int":rc="// "+f+" \n"+"var tmp1 = get_screen_content() ;\n"+"var "+p[0]+" = parseInt(tmp1) ;\n";break;case"read_float":rc="// "+f+" \n"+"var tmp1 = get_screen_content() ;\n"+"var "+p[0]+" = parseFloat(tmp1) ;\n";break;case"read_double":rc="// "+f+" \n"+"var tmp1 = get_screen_content() ;\n"+"var "+p[0]+" = parseFloat(tmp1) ;\n";break;case"read_string":rc="// "+f+" \n"+"var tmp1 = get_screen_content() ;\n"+"for (var k=0; k<"+p[1]+"; k++) {\n"+'     simcore_native_set_value("MEMORY", '+p[0]+"+k, tmp1[k]) ;\n"+"} ;\n";break;case"sbrk":rc="// "+f+" \n"+"// TODO: _sbrk_("+p[0]+", "+p[1]+");\n";break;case"exit":rc="// "+f+" \n"+"// exit by setting P.C. register outside text segment\n"+"var pc_name = simhw_sim_ctrlStates_get().pc.state ;\n"+'simcore_native_set_value("CPU", pc_name, 0x00000000) ;\n';break;default:rc="// "+f+" \n"+"// unknown syscall\n";break}me=new RegExp(f+"\\(([^)]*)\\)","g");icode=icode.replace(me,rc);match=re.exec(icode)}return icode}function simlang_native_adapt_replaceMemoryAccess(icode,a_type,a_mask){var re=new RegExp("MP."+a_type+".\\[([^\\]]*)\\]","g");if(icode.search(re)!=-1){var match=re.exec(icode);try{var param=match[1];icode=icode.replace(re,"value");icode='value = simcore_native_get_value("MEMORY", '+param+") ;\n"+"value = value & "+a_mask+";\n"+icode+'simcore_native_set_value("MEMORY", '+param+", value) ;\n"}catch(e){console.log("Syntax error that cause a run-time error: "+e.toString());console.log(match)}}return icode}function simlang_native_adapt_provideRegister(icode,reg_log,rf_phy,reg_phy){var re=new RegExp(reg_log,"g");if(icode.search(re)!=-1){icode="var "+reg_log+" = simcore_native_get_value('"+rf_phy+"', "+reg_phy+") ;\n"+icode+"\n"+"simcore_native_set_value('"+rf_phy+"', "+reg_phy+", "+reg_log+") ;\n"}return icode}function simlang_native_adapt_providePC(icode){var re=/PC/g;if(icode.search(re)!=-1){icode="var pc_name = simhw_sim_ctrlStates_get().pc.state ;\n"+"var PC = simcore_native_get_value('CPU', pc_name) ;\n"+icode+"simcore_native_set_value('CPU', pc_name, PC) ;\n"}return icode}function simlang_native_adapt_replaceField(icode,h_names){var re=new RegExp("Field\\.([^\\.]+)\\.\\(([^\\\\)]*)\\)","g");var match=re.exec(icode);while(match!==null){try{var index=match[1];var params=match[2].split(",");var p1=params[0].trim();var p2=params[1].trim();var me=new RegExp("Field\\."+index+"\\.\\("+p1+","+p2+"\\)","g");var value="sel("+parseInt(p2)+","+parseInt(p1)+","+h_names[index]+")";icode=icode.replace(me,value)}catch(e){console.log("Syntax error that cause a run-time error: "+e.toString());console.log(match)}match=re.exec(icode)}return icode}function simlang_native_adapt_replaceIf(icode){var re=new RegExp("[iI][fF]\\s*\\(([^\\\\)]*)\\)\\s*{([^\\\\}]*)}\\s*[eE][lL][sS][eE]{[^}]*}\\s*","g");if(icode.search(re)!=-1){var match=re.exec(icode);try{icode=icode.replace(re,"\n")}catch(e){console.log("Syntax error that cause a run-time error: "+e.toString());console.log(match)}}return icode}function simlang_native_adapt_addInitialTabTab(lines_code){var code_lines;code_lines=lines_code.split("\n");code_lines=code_lines.map((function(x){return"\t\t"+x}));return code_lines.join("\n")}function simlang_native_adapt_instructionDefinition(lines_code){var code_lines=lines_code.split(";");if(code_lines.length===1&&!lines_code.trim().startsWith("if")){lines_code=lines_code+";\n"}lines_code=simlang_native_adapt_replaceAssert(lines_code);lines_code=simlang_native_adapt_replaceCheckStackLimit(lines_code);lines_code=simlang_native_adapt_replaceSyscall(lines_code);lines_code=simlang_native_adapt_provideRegister(lines_code,"HI","CPU","'REG_RT2'");lines_code=simlang_native_adapt_provideRegister(lines_code,"LO","CPU","'REG_RT1'");lines_code=simlang_native_adapt_provideRegister(lines_code,"ra","BR","31");lines_code=simlang_native_adapt_providePC(lines_code);lines_code=simlang_native_adapt_replaceMemoryAccess(lines_code,"w","0xFFFFFFFF");lines_code=simlang_native_adapt_replaceMemoryAccess(lines_code,"h","0x0000FFFF");lines_code=simlang_native_adapt_replaceMemoryAccess(lines_code,"b","0x000000FF");lines_code=simlang_native_adapt_addInitialTabTab(lines_code);return lines_code}function simlang_native_adapt_getField(j,rf,reg){return"\t\t"+"var f_"+reg+" = "+"simcore_native_get_field_from_ir(fields, "+j+") ;\n"+"\t\t"+"var   "+reg+" = "+"simcore_native_get_value('"+rf+"', f_"+reg+") ;\n"}function simlang_native_adapt_setField(j,rf,reg){return"\t\t"+"simcore_native_set_value('"+rf+"', f_"+reg+", "+reg+");\n"}function simlang_native_adapt_headerField(fname,tname,start,stop){return"\t"+fname+"="+tname+"("+start+","+stop+"),\n"}function simlang_native_beginMicrocode(){var o="";o+="\n"+"#\n"+"# WepSIM (https://wepsim.github.io/wepsim/)\n"+"#\n"+"\n"+"\n"+"##\n"+"## Microcode Section\n"+"##\n"+"\n"+"begin,\n"+"native\n"+"{\n"+"                // (once) initialize BR2 as FP register file\n"+'                if (typeof BR2 === "undefined")\n'+"                {\n"+"                    BR2 = [] ;\n"+"                    FCSR = 0 ;\n"+"                    for (var i=0; i<32; i++)\n"+"                    {\n"+"                         BR2[i] = {\n"+'                                    name:"R"+i,\n'+'                                    verbal:"Register "+i,\n'+"                                    visible:true,\n"+'                                    nbits:"32",\n'+"                                    value:0,\n"+"                                    default_value:0,\n"+"                                    draw_data:[]\n"+"                                  } ;\n"+"                    }\n"+"                }\n"+"\n"+"                // fetch\n"+'                var addr  = simcore_native_get_value("CPU", "REG_PC") ;\n'+'                var value = simcore_native_get_value("MEMORY", addr) ;\n'+"\n"+'                simcore_native_set_value("CPU", "REG_IR", value) ;\n'+'                simcore_native_set_value("CPU", "REG_PC", addr + 4) ;\n'+"\n"+"                simcore_native_deco() ;\n"+"                simcore_native_go_opcode() ;\n"+"}\n";return o}function simlang_native_adapt_instructionSet(instruction_list){var o="";var gfields=[];var sfields=[];var hfields=[];var io={};var line_signature="";var signature_names="";var signature_order="";for(var i=0;i<instruction_list.length;i++){io=instruction_list[i];var k=0;line_signature=io.signatureRaw.replace(/\$/g,"");signature_names=line_signature.replace(/[\(\)]/g," ").split(" ");signature_order=[];for(k=0;k<signature_names.length;k++){signature_order[signature_names[k]]=k}gfields=[];sfields=[];hfields=[];for(j=0;j<io.fields.length;j++){if(io.fields[j].type==="co"||io.fields[j].type==="cop"){continue}k=signature_order[io.fields[j].name];switch(io.fields[j].type){case"INT-Reg":case"SFP-Reg":var rf_name="BR";if(io.fields[j].type==="SFP-Reg")rf_name="BR2";hfields[k]=simlang_native_adapt_headerField(io.fields[j].name,"reg",io.fields[j].startbit,io.fields[j].stopbit);gfields[k]=simlang_native_adapt_getField(k-1,rf_name,io.fields[j].name);sfields[k]=simlang_native_adapt_setField(k-1,rf_name,io.fields[j].name);break;case"DFP-Reg":hfields[k]=simlang_native_adapt_headerField(io.fields[j].name,"reg",io.fields[j].startbit,io.fields[j].stopbit);gfields[k]="\t\t"+"var f_"+io.fields[j].name+" = "+"simcore_native_get_field_from_ir(fields, "+(k-1)+") ;\n"+"\t\t"+"var   "+io.fields[j].name+"1 = "+"simcore_native_get_value('BR2', f_"+io.fields[j].name+"+0) ;\n"+"\t\t"+"var   "+io.fields[j].name+"2 = "+"simcore_native_get_value('BR2', f_"+io.fields[j].name+"+1) ;\n"+"\t\t"+"var   "+io.fields[j].name+" = "+"("+io.fields[j].name+"1) | ("+io.fields[j].name+"2 << 32);\n";sfields[k]="\t\t "+io.fields[j].name+"1 = (("+io.fields[j].name+" << 32) >> 32);\n"+"\t\t "+io.fields[j].name+"2 = "+io.fields[j].name+"   >> 32;\n"+"\t\t"+"simcore_native_set_value('BR2', "+"f_"+io.fields[j].name+"+0, "+io.fields[j].name+"1);\n"+"\t\t"+"simcore_native_set_value('BR2', "+"f_"+io.fields[j].name+"+1, "+io.fields[j].name+"2);\n";break;case"inm":hfields[k]=simlang_native_adapt_headerField(io.fields[j].name,"inm",io.fields[j].startbit,io.fields[j].stopbit);gfields[k]="\t\t"+"var "+io.fields[j].name+" = "+"simcore_native_get_field_from_ir(fields, "+(k-1)+") ;\n\t";break}}var co_cop="\t"+"co=111111,"+"\n";var lines_code=simlang_native_adapt_instructionDefinition(io.definition);if(lines_code.trim()!==""){lines_code="\t\t"+"// instruction specific code"+"\n"+lines_code+"\n"}var gfields_str=gfields.join("");if(gfields_str.trim()!==""){gfields_str="\t\t"+"// get fields values..."+"\n"+gfields_str+"\n"}var sfields_str=sfields.join("");if(sfields_str.trim()!==""){sfields_str="\t\t"+"// set fields values..."+"\n"+sfields_str+"\n"}o+="\n"+line_signature+" {"+"\n"+co_cop+"\t"+"nwords="+io.nwords+","+"\n"+hfields.join("")+"\t"+"native,"+"\n"+"\t"+"{\n"+gfields_str+lines_code+sfields_str+"\t\t"+"// go fetch"+"\n"+"\t\t"+"simcore_native_go_maddr(0);"+"\n"+"\t"+"}"+"\n"+"}\n"}return o}function simlang_native_registerSection(register_list){var o="";var d="";var index=0;for(index=0;index<register_list.length;index++){if(register_list[index].type==="integer")break}o+="\n"+"##\n"+"## Register section\n"+"##\n"+"\n"+"registers\n"+"{\n";for(var i=0;i<register_list[index].elements.length;i++){d=register_list[index].elements[i].name;if(i===29)d+=" (stack_pointer)";o+="\t"+i+"=$"+d+",\n"}o+="}\n"+"\n";return o}function simlang_native_adapt_pseudoInstructions(pseudoinstruction_list){var o="";var d="";var h="";var hn=null;var ht=null;o+="\n"+"##\n"+"## Pseudo-instruction section\n"+"##\n"+"\n"+"pseudoinstructions\n"+"{\n";for(var i=0;i<pseudoinstruction_list.length;i++){hn=pseudoinstruction_list[i].signatureRaw.replace(/\$/g,"").split(" ");ht=pseudoinstruction_list[i].signature.replace(/\$/g,"").replace(/INT-Reg/g,"reg").replace(/SFP-Reg/g,"reg").replace(/DFP-Reg/g,"reg").split(",");h=hn[0]+" ";for(var j=1;j<hn.length;j++){h+=hn[j]+"="+ht[j]+" "}d=pseudoinstruction_list[i].definition.replace(/\$/g,"");d=simlang_native_adapt_replaceIf(d);d=simlang_native_adapt_replaceField(d,hn);d=simlang_native_adapt_addInitialTabTab(d);o+="\t"+h+"\n"+"\t{\n"+d+"\n"+"\t}\n"+"\t\n"}o+="}\n"+"\n";return o}function simlang_firm_is2native(data){var o="";if(data===null){return o}if(typeof data==="undefined"){return o}o=simlang_native_beginMicrocode()+simlang_native_adapt_instructionSet(data.instructions)+simlang_native_registerSection(data.components)+simlang_native_adapt_pseudoInstructions(data.pseudoinstructions);return o}var WSCFG={};function get_cfg(field){return WSCFG[field].value}function set_cfg(field,value){WSCFG[field].value=value}function update_cfg(field,value){WSCFG[field].value=value;simcore_record_append_new("Set configuration option "+field+" to "+value,'update_cfg("'+field+'","'+value+'");\n');ga("send","event","config","config."+WSCFG.version.value,"config."+WSCFG.version.value+"."+field+"."+value);save_cfg()}function save_cfg(){try{for(var item in WSCFG){localStorage.setItem("wepsim_"+item,get_cfg(item))}}catch(err){console.log("WepSIM can not save the configuration in a persistent way on this web browser,\n"+"found following error: \n"+err.message)}set_secondary_cfg()}function restore_cfg(){WSCFG=get_primary_cfg();set_secondary_cfg();if(localStorage===null){return}var default_value=null;var saved_value=null;for(var item in WSCFG){if(item==="version"){continue}default_value=get_cfg(item);set_cfg(item,localStorage.getItem("wepsim_"+item));if(WSCFG[item].type!="string"){try{saved_value=JSON.parse(get_cfg(item));set_cfg(item,saved_value)}catch(e){saved_value=null}}if(saved_value===null){set_cfg(item,default_value)}}set_secondary_cfg()}function reset_cfg(){WSCFG=get_primary_cfg();set_secondary_cfg();save_cfg()}function reset_cfg_values(){WSCFG=get_primary_cfg();set_secondary_cfg()}function upgrade_cfg(){var wscfg=get_primary_cfg();var item=null;for(item in wscfg){if(typeof WSCFG[item]==="undefined"){WSCFG[item]=wscfg[item]}if(WSCFG[item].value===null||WSCFG[item].value==="null"){WSCFG[item].value=wscfg[item].value}}if(wscfg.build.value!=WSCFG.build.value){for(item in wscfg){if(wscfg[item].upgrade){WSCFG[item]=wscfg[item]}}}set_secondary_cfg();save_cfg()}function is_mobile(){if(typeof navigator==="undefined"){return false}return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}function is_cordova(){return document.URL.indexOf("http://")===-1&&document.URL.indexOf("https://")===-1}function get_primary_cfg(){var wscfg={version:{upgrade:false,type:"string",value:"2.1.0"},build:{upgrade:true,type:"string",value:"2.1.0.20200612D"},color_data_active:{upgrade:false,type:"string",value:"#0066FF"},color_data_inactive:{upgrade:false,type:"string",value:"rgb(0, 0, 0)"},color_name_active:{upgrade:false,type:"string",value:"red"},color_name_inactive:{upgrade:false,type:"string",value:"rgb(0, 0, 0)"},size_active:{upgrade:false,type:"float",value:1.25},size_inactive:{upgrade:false,type:"float",value:.02},is_byvalue:{upgrade:false,type:"boolean",value:false},RF_display_format:{upgrade:false,type:"string",value:"unsigned_16_fill"},RF_display_name:{upgrade:false,type:"string",value:"numerical"},is_editable:{upgrade:false,type:"boolean",value:true},DBG_delay:{upgrade:false,type:"int",value:5},DBG_level:{upgrade:false,type:"string",value:"microinstruction"},DBG_limitins:{upgrade:false,type:"int",value:1e4},DBG_limitick:{upgrade:false,type:"int",value:1e3},ICON_theme:{upgrade:false,type:"string",value:"classic"},NOTIF_delay:{upgrade:false,type:"int",value:1e3},CPUCU_size:{upgrade:true,type:"int",value:7},C1C2_size:{upgrade:true,type:"int",value:8},SHOWCODE_label:{upgrade:false,type:"boolean",value:true},SHOWCODE_addr:{upgrade:false,type:"boolean",value:true},SHOWCODE_hex:{upgrade:false,type:"boolean",value:true},SHOWCODE_ins:{upgrade:false,type:"boolean",value:true},SHOWCODE_pins:{upgrade:false,type:"boolean",value:true},ws_mode:{upgrade:false,type:"string",value:"newbie"},ws_action:{upgrade:false,type:"string",value:"checkpoint"},is_interactive:{upgrade:false,type:"boolean",value:true},is_quick_interactive:{upgrade:false,type:"boolean",value:false},ws_idiom:{upgrade:false,type:"string",value:"en"},use_voice:{upgrade:false,type:"boolean",value:false},ws_skin_ui:{upgrade:false,type:"string",value:"classic"},ws_skin_user:{upgrade:false,type:"string",value:"only_asm:of:only_frequent:of"},ws_skin_dark_mode:{upgrade:false,type:"boolean",value:false},editor_theme:{upgrade:false,type:"string",value:"default"},editor_mode:{upgrade:false,type:"string",value:"default"},base_url:{upgrade:true,type:"string",value:"https://acaldero.github.io/wepsim/ws_dist/"},cfg_url:{upgrade:true,type:"string",value:"examples/configuration/default.json"},example_url:{upgrade:true,type:"string",value:"examples/examples_set/default.json"},hw_url:{upgrade:true,type:"string",value:"examples/hardware/hw.json"},max_json_size:{upgrade:true,type:"int",value:1*1024*1024},verbal_verbose:{upgrade:false,type:"string",value:"math"}};if(is_mobile()){wscfg.NOTIF_delay.value=2e3;wscfg.ICON_theme.value="cat1";wscfg.CPUCU_size.value=7;wscfg.C1C2_size.value=14;wscfg.ws_skin_ui.value="compact"}return wscfg}function set_secondary_cfg(){var dbg_delay=get_cfg("DBG_delay");if(dbg_delay<5){cfg_show_rf_delay=350;cfg_show_eltos_delay=350;cfg_show_main_memory_delay=450;cfg_show_control_memory_delay=360;cfg_show_dbg_ir_delay=300;cfg_show_rf_refresh_delay=120}else{cfg_show_rf_delay=100;cfg_show_eltos_delay=100;cfg_show_main_memory_delay=150;cfg_show_control_memory_delay=120;cfg_show_dbg_ir_delay=100;cfg_show_rf_refresh_delay=30}cfg_show_asmdbg_pc_delay=50;if(dbg_delay<3)cfg_show_asmdbg_pc_delay=150}var ws_cfg_hash={};var ws_cfg_set=[];function cfgset_init(){var url_list=get_cfg("cfg_url");ws_cfg_set=wepsim_url_getJSON(url_list);for(var i=0;i<ws_cfg_set.length;i++){ws_cfg_hash[ws_cfg_set[i].name]=ws_cfg_set[i].url}return ws_cfg_hash}function cfgset_getSet(){return ws_cfg_hash}function cfgset_load(cfg_name){var ret=null;var jobj=null;if(typeof ws_cfg_hash[cfg_name]==="undefined"){return ret}try{jobj=$.getJSON({url:ws_cfg_hash[cfg_name],async:false});jobj=JSON.parse(jobj.responseText);ret=cfgset_import(jobj)}catch(e){ws_alert("WepSIM can not import the configuration from URL: \n'"+ws_cfg_hash[cfg_name]+"'.\n"+"Found following error: \n"+err.message)}return ret}function cfgset_import(wscfg){for(var item in wscfg){if(typeof WSCFG[item]==="undefined"){continue}if(WSCFG[item].type!==wscfg[item].type){continue}WSCFG[item]=wscfg[item]}set_secondary_cfg();return true}var ws_records=[];var ws_last_played=0;var ws_last_toplay=0;var ws_last_time=0;var ws_last_timer=null;var ws_is_recording=false;var ws_is_playing=false;var ws_record_msg_name="";var ws_record_msg_obj=null;var ws_record_pb_name="";var ws_record_pb_obj=null;function simcore_record_pushElto(desc,elto,distance){var record={timestamp:distance,description:desc,element:elto};ws_records.push(record)}function simcore_record_showMsg(index,msg){if(ws_record_msg_obj!==null){ws_record_msg_obj.html("<em>"+index+"/"+ws_records.length+"</em>&nbsp;"+msg)}if(ws_record_pb_obj!==null){var next_pbval=100*index/ws_records.length;ws_record_pb_obj.css("width",next_pbval+"%").attr("aria-valuenow",next_pbval)}}function simcore_record_playAt(index_current,index_last){if(ws_is_playing===false){simcore_record_showMsg(ws_last_played,"Stopped by user.");return}ws_last_played=index_current;if(index_current>=index_last){simcore_record_showMsg(index_last,"Done.");return}if(ws_records[index_current].description==="_pending event_"){simcore_record_playAt(index_current+1,index_last);return}eval(ws_records[index_current].element);var index_next=index_current+1;simcore_record_showMsg(index_next,ws_records[index_current].description);var wait_time=500;if(index_next<index_last){wait_time=ws_records[index_next].timestamp}if(wait_time!==0){wait_time=wait_time<500?500:wait_time}ws_last_timer=setTimeout((function(){simcore_record_playAt(index_next,index_last)}),wait_time)}var ws_glowing_time=250;function simcore_record_glowing(ui_id){var ui_obj=$(ui_id);if(ui_obj===null){return}ui_obj.addClass("btn-warning");setTimeout((function(){ui_obj.removeClass("btn-warning")}),ws_glowing_time)}function simcore_record_glowAdd(){var ui_obj=$(this);var ui_id=ui_obj.attr("id");if(typeof ui_id==="undefined"){return}if(ws_is_recording===false){return}ui_obj.one("click",simcore_record_glowAdd);simcore_record_resolve_pending("Click on UI element "+ui_id,'simcore_record_glowing("#'+ui_id+'");\n')}function simcore_record_init(div_msg_id,div_pb_id){ws_records=[];ws_last_played=0;ws_last_time=0;ws_is_playing=false;ws_is_recording=false;ws_record_msg_name=div_msg_id;ws_record_msg_obj=$("#"+div_msg_id);if(typeof ws_record_msg_obj.html==="undefined"){ws_record_msg_obj=null}ws_record_pb_name=div_pb_id;ws_record_pb_obj=$("#"+div_pb_id);if(typeof ws_record_pb_obj.html==="undefined"){ws_record_pb_obj=null}}function simcore_record_captureInit(){$(".nav-link").off("click",simcore_record_glowAdd);$(".btn-like").off("click",simcore_record_glowAdd);$(".btn").off("click",simcore_record_glowAdd);$(".nav-link").one("click",simcore_record_glowAdd);$(".btn-like").one("click",simcore_record_glowAdd);$(".btn").one("click",simcore_record_glowAdd)}function simcore_record_start(){ws_is_playing=false;ws_is_recording=true;ws_last_played=0;ws_last_time=Date.now();simcore_record_showMsg(ws_last_played,"Recording...")}function simcore_record_stop(){ws_is_playing=false;ws_is_recording=false;ws_last_played=0;ws_last_toplay=ws_records.length;simcore_record_showMsg(ws_last_played,"Stopped by user.")}function simcore_record_isRecording(){return ws_is_recording}function simcore_record_play(){if(ws_is_playing===true){clearTimeout(ws_last_timer);if(ws_last_played<ws_records.length)ws_last_played=ws_last_played+1;else ws_last_played=0}else{ws_last_toplay=ws_records.length}ws_is_playing=true;ws_is_recording=false;simcore_record_playAt(ws_last_played,ws_last_toplay)}function simcore_record_playInterval(from,to){if(ws_is_playing===true){clearTimeout(ws_last_timer);if(ws_last_played<to)ws_last_played=ws_last_played+1;else ws_last_played=from}else{ws_last_played=from}ws_last_toplay=to;ws_is_playing=true;ws_is_recording=false;simcore_record_playAt(ws_last_played,ws_last_toplay)}function simcore_record_pause(){ws_is_playing=!ws_is_playing;ws_is_recording=false;if(ws_is_playing===true){simcore_record_playAt(ws_last_played,ws_last_toplay)}}function simcore_record_isPlaying(){return ws_is_playing}function simcore_record_length(){return ws_records.length}function simcore_record_get(){return ws_records}function simcore_record_set(records){ws_last_played=0;ws_last_time=0;ws_is_playing=false;ws_is_recording=false;ws_records=records;simcore_record_showMsg(0,"Record restored.")}function simcore_record_reset(){ws_last_played=0;ws_last_toplay=0;ws_last_time=0;ws_is_playing=false;ws_is_recording=false;ws_records=[];simcore_record_showMsg(0,"Empty record")}function simcore_record_append_new(description,elto){if(ws_is_recording===true){var distance=Date.now()-ws_last_time;ws_last_time=Date.now();simcore_record_pushElto(description,elto,distance);simcore_record_showMsg(0,"Recording...")}}function simcore_record_append_pending(){if(ws_is_recording===true){var distance=Date.now()-ws_last_time;ws_last_time=Date.now();if(0==distance&&ws_records.length>0&&ws_records[ws_records.length-1].description==="_pending event_"){distance=ws_glowing_time}simcore_record_pushElto("_pending event_",";",distance)}}function simcore_record_resolve_pending(description,elto){if(ws_is_recording===true){var last_pending=ws_records.length;while(last_pending>0){last_pending--;if(ws_records[last_pending].description==="_pending event_"){break}}if(last_pending===0){simcore_record_setTimeBeforeNow(0);simcore_record_append_new(description,elto);return}ws_records[last_pending].description=description;ws_records[last_pending].element=elto;simcore_record_showMsg(0,"Recording...")}}function simcore_record_setTimeBeforeNow(distance){ws_last_time=Date.now()-distance}function simcore_record_addTimeAfterLast(distance){ws_last_time=ws_last_time+distance}function get_simware(){var cf=simhw_internalState("FIRMWARE");if(typeof cf["firmware"]=="undefined")cf["firmware"]=[];if(typeof cf["mp"]=="undefined")cf["mp"]={};if(typeof cf["seg"]=="undefined")cf["seg"]={};if(typeof cf["assembly"]=="undefined")cf["assembly"]={};if(typeof cf["labels"]=="undefined")cf["labels"]={};if(typeof cf["labels2"]=="undefined")cf["labels2"]={};if(typeof cf["labels_firm"]=="undefined")cf["labels_firm"]={};if(typeof cf["registers"]=="undefined")cf["registers"]={};if(typeof cf["pseudoInstructions"]=="undefined")cf["pseudoInstructions"]=[];if(typeof cf["stackRegister"]=="undefined")cf["stackRegister"]={};if(typeof cf["cihash"]=="undefined")cf["cihash"]={};if(typeof cf["cocop_hash"]=="undefined")cf["cocop_hash"]={};return cf}function set_simware(preWARE){var cf=simhw_internalState("FIRMWARE");if(typeof preWARE["firmware"]!="undefined")cf["firmware"]=preWARE["firmware"];if(typeof preWARE["mp"]!="undefined")cf["mp"]=preWARE["mp"];if(typeof preWARE["registers"]!="undefined")cf["registers"]=preWARE["registers"];if(typeof preWARE["assembly"]!="undefined")cf["assembly"]=preWARE["assembly"];if(typeof preWARE["pseudoInstructions"]!="undefined")cf["pseudoInstructions"]=preWARE["pseudoInstructions"];if(typeof preWARE["seg"]!="undefined")cf["seg"]=preWARE["seg"];if(typeof preWARE["labels"]!="undefined")cf["labels"]=preWARE["labels"];if(typeof preWARE["labels2"]!="undefined")cf["labels2"]=preWARE["labels2"];if(typeof preWARE["labels_firm"]!="undefined")cf["labels_firm"]=preWARE["labels_firm"];if(typeof preWARE["stackRegister"]!="undefined")cf["stackRegister"]=preWARE["stackRegister"];if(typeof preWARE["cihash"]!="undefined")cf["cihash"]=preWARE["cihash"];if(typeof preWARE["cocop_hash"]!="undefined")cf["cocop_hash"]=preWARE["cocop_hash"]}function array_includes(arr,val){if(typeof arr.includes!="undefined"){return arr.includes(val)}for(var i=0;i<arr.length;i++){if(arr[i]==val){return true}}return false}function check_buses(fired){var tri_state_names=simhw_internalState("tri_state_names");if(tri_state_names.indexOf(fired)==-1){return}if(simhw_internalState_get("fire_visible","databus")==true){update_bus_visibility("databus_fire","hidden");simhw_internalState_set("fire_visible","databus",false)}if(simhw_sim_signal("TD").value!=0&&simhw_sim_signal("R").value!=0){update_bus_visibility("databus_fire","visible");simhw_internalState_set("fire_visible","databus",true);simhw_sim_state("BUS_DB").value=4294967295}var tri_name="";var tri_activated=0;var tri_activated_name="";var tri_activated_value=0;for(var i=0;i<tri_state_names.length;i++){tri_activated_name=tri_state_names[i];tri_activated_value=parseInt(get_value(simhw_sim_signal(tri_activated_name)));tri_activated+=tri_activated_value;if(tri_activated_value>0)tri_name=tri_activated_name;if(tri_activated>1)break}if(tri_activated>0){update_draw(simhw_sim_signal(tri_name),1)}if(simhw_internalState_get("fire_visible","internalbus")==true){update_bus_visibility("internalbus_fire","hidden");simhw_internalState_set("fire_visible","internalbus",false)}if(tri_activated>1){update_bus_visibility("internalbus_fire","visible");simhw_internalState_set("fire_visible","internalbus",true);simhw_sim_state("BUS_IB").value=4294967295}}function fn_updateE_now(key){if("E"==simhw_sim_signal(key).type){update_state(key)}}function fn_updateE_future(key){if(jit_fire_ndep[key]<1)fn_updateE_now(key);else return new Promise((function(resolve,reject){fn_updateE_now(key)}))}function fn_updateL_now(key){update_draw(simhw_sim_signal(key),simhw_sim_signal(key).value);if("L"==simhw_sim_signal(key).type){update_state(key)}}function fn_updateL_future(key){if(jit_fire_ndep[key]<1)fn_updateL_now(key);else return new Promise((function(resolve,reject){fn_updateL_now(key)}))}function update_state(key){var index_behavior=0;switch(simhw_sim_signal(key).behavior.length){case 0:return;break;case 1:index_behavior=0;break;default:index_behavior=simhw_sim_signal(key).value;if(simhw_sim_signal(key).behavior.length<index_behavior){ws_alert("ALERT: there are more signals values than behaviors defined!!!!\n"+"key: "+key+" and signal value: "+index_behavior);return}break}compute_signal_behavior(key,index_behavior)}function update_signal_firmware(key){var SIMWARE=get_simware();var maddr_name=simhw_sim_ctrlStates_get().mpc.state;var reg_maddr=get_value(simhw_sim_state(maddr_name));var assoc_i=-1;for(var i=0;i<SIMWARE["firmware"].length;i++){if(parseInt(SIMWARE["firmware"][i]["mc-start"])>reg_maddr){break}assoc_i=i}if(-1==assoc_i){ws_alert("A new 'unknown' instruction is inserted,\n"+"please edit it (co, nwords, etc.) in the firmware textarea.");var new_ins=new Object;new_ins["name"]="unknown";new_ins["signature"]="unknown";new_ins["signatureGlobal"]="unknown";new_ins["co"]=0;new_ins["nwords"]=0;new_ins["mc-start"]=0;new_ins["fields"]=new Array;new_ins["microcode"]=new Array;new_ins["microcomments"]=new Array;SIMWARE["firmware"].push(new_ins);assoc_i=SIMWARE["firmware"].length-1}var pos=reg_maddr-parseInt(SIMWARE["firmware"][assoc_i]["mc-start"]);if(typeof SIMWARE["firmware"][assoc_i]["microcode"][pos]=="undefined"){SIMWARE["firmware"][assoc_i]["microcode"][pos]=new Object;SIMWARE["firmware"][assoc_i]["microcomments"][pos]=""}SIMWARE["firmware"][assoc_i]["microcode"][pos][key]=simhw_sim_signal(key).value;if(simhw_sim_signal(key).default_value==simhw_sim_signal(key).value){delete SIMWARE["firmware"][assoc_i]["microcode"][pos][key]}var bits=get_value(simhw_sim_state("REG_IR")).toString(2);bits="00000000000000000000000000000000".substring(0,32-bits.length)+bits;show_memories_values()}function propage_signal_update(key){if(true===get_cfg("is_interactive")){if(simhw_sim_signal(key).value!=simhw_sim_signal(key).default_value)simhw_sim_state("REG_MICROINS").value[key]=simhw_sim_signal(key).value;else delete simhw_sim_state("REG_MICROINS").value[key];var maddr_name=simhw_sim_ctrlStates_get().mpc.state;var curr_maddr=get_value(simhw_sim_state(maddr_name));if(typeof simhw_internalState_get("MC",curr_maddr)=="undefined"){simhw_internalState_set("MC",curr_maddr,new Object);simhw_internalState_set("MC_dashboard",curr_maddr,new Object)}simhw_internalState_get("MC",curr_maddr)[key]=simhw_sim_signal(key).value;simhw_internalState_get("MC_dashboard",curr_maddr)[key]={comment:"",breakpoint:false,state:false,notify:new Array};update_signal_firmware(key);var SIMWARE=get_simware();document.getElementById("inputFirmware").value=saveFirmware(SIMWARE)}compute_behavior("FIRE "+key)}function update_memories(preSIMWARE){var i=0;set_simware(preSIMWARE);var SIMWARE=get_simware();simhw_internalState_reset("MC",{});simhw_internalState_reset("MC_dashboard",{});for(i=0;i<SIMWARE["firmware"].length;i++){var elto_state=false;var elto_break=false;var elto_notify=new Array;var last=SIMWARE["firmware"][i]["microcode"].length;var mci=SIMWARE["firmware"][i]["mc-start"];for(var j=0;j<last;j++){var comment=SIMWARE["firmware"][i]["microcomments"][j];elto_state=comment.trim().split("state:").length>1;elto_break=comment.trim().split("break:").length>1;elto_notify=comment.trim().split("notify:");for(var k=0;k<elto_notify.length;k++){elto_notify[k]=elto_notify[k].split("\n")[0]}simhw_internalState_set("MC",mci,SIMWARE["firmware"][i]["microcode"][j]);simhw_internalState_set("MC_dashboard",mci,{comment:comment,state:elto_state,breakpoint:elto_break,notify:elto_notify});mci++}}simhw_internalState_reset("ROM",{});for(i=0;i<SIMWARE["firmware"].length;i++){if("begin"==SIMWARE["firmware"][i]["name"]){continue}var ma=SIMWARE["firmware"][i]["mc-start"];var co=parseInt(SIMWARE["firmware"][i]["co"],2);var cop=0;if(typeof SIMWARE["firmware"][i]["cop"]!="undefined")cop=parseInt(SIMWARE["firmware"][i]["cop"],2);var rom_addr=64*co+cop;simhw_internalState_set("ROM",rom_addr,ma);SIMWARE["cihash"][rom_addr]=SIMWARE["firmware"][i]["signature"]}simhw_internalState_reset("MP",{});for(var key in SIMWARE["mp"]){var kx=parseInt(key);var kv=parseInt(SIMWARE["mp"][key].replace(/ /g,""),2);simhw_internalState_set("MP",kx,kv)}simhw_internalState_reset("segments",{});for(var key in SIMWARE["seg"]){simhw_internalState_set("segments",key,SIMWARE["seg"][key])}show_main_memory(simhw_internalState("MP"),0,true,true);show_control_memory(simhw_internalState("MC"),simhw_internalState("MC_dashboard"),0,true)}function hex2float(hexvalue){var sign=hexvalue&2147483648?-1:1;var exponent=(hexvalue>>23&255)-127;var mantissa=1+(hexvalue&8388607)/8388608;var valuef=sign*mantissa*Math.pow(2,exponent);if(-127===exponent)if(1===mantissa)valuef=sign===1?"+0":"-0";else valuef=sign*((hexvalue&8388607)/8388607)*Math.pow(2,-126);if(128===exponent)if(1===mantissa)valuef=sign===1?"+Inf":"-Inf";else valuef="NaN";return valuef}function hex2char8(hexvalue){var valuec=[];valuec[0]=String.fromCharCode((hexvalue&4278190080)>>24);valuec[1]=String.fromCharCode((hexvalue&16711680)>>16);valuec[2]=String.fromCharCode((hexvalue&65280)>>8);valuec[3]=String.fromCharCode((hexvalue&255)>>0);return valuec}function pack5(val){return"00000".substring(0,5-val.length)+val}function pack8(val){return"00000000".substring(0,8-val.length)+val}function pack32(val){return"00000000000000000000000000000000".substring(0,32-val.length)+val}function hex2bin(hexvalue){var valuebin=hexvalue.toString(2);valuebin=pack32(valuebin);valuebin=valuebin.substring(0,4)+" "+valuebin.substring(4,8)+" "+valuebin.substring(8,12)+" "+valuebin.substring(12,16)+"<br>"+valuebin.substring(16,20)+" "+valuebin.substring(20,24)+" "+valuebin.substring(24,28)+" "+valuebin.substring(28,32);return valuebin}function value2string(format,value){var fmt_value="";var fmt=format.split("_");switch(fmt[0]){case"unsigned":fmt_value=value.toString(fmt[1]).toUpperCase();break;case"float":fmt_value=hex2float(value);break;default:fmt_value=value.toString()}if(fmt[2]==="fill"){fmt_value=pack8(fmt_value)}return fmt_value}function get_deco_from_pc(pc){var hexstrpc="0x"+pc.toString(16);var curr_firm=simhw_internalState("FIRMWARE");if(typeof curr_firm.assembly==="undefined"||typeof curr_firm.assembly[hexstrpc]==="undefined"||typeof curr_firm.assembly[hexstrpc].source==="undefined"){return""}return curr_firm.assembly[hexstrpc].source}function get_verbal_from_current_mpc(){var active_signals="";var active_verbal="";var maddr_name=simhw_sim_ctrlStates_get().mpc.state;var curr_maddr=get_value(simhw_sim_state(maddr_name));var mins=simhw_internalState_get("MC",curr_maddr);for(var key in mins){if("MADDR"===key){active_verbal=active_verbal+"MADDR is "+mins[key]+". ";continue}active_signals=active_signals+key+" ";active_verbal=active_verbal+compute_signal_verbals(key,mins[key])}active_signals=active_signals.trim();if(active_signals==="")active_signals="<no active signal>";if(active_verbal.trim()==="")active_verbal="<no actions>";return"Activated signals are: "+active_signals+". Associated actions are: "+active_verbal}function get_verbal_from_current_pc(){var pc_name=simhw_sim_ctrlStates_get().pc.state;var reg_pc=get_value(simhw_sim_state(pc_name));var pc=parseInt(reg_pc)-4;var decins=get_deco_from_pc(pc);if(""==decins.trim()){decins="not jet defined"}return"Current instruction is: "+decins+" and PC points to "+show_value(pc)+". "}function ko_observable(initial_value){if(typeof ko==="undefined"){return initial_value}if(typeof cfg_show_rf_refresh_delay==="undefined"){cfg_show_rf_refresh_delay=120}return ko.observable(initial_value).extend({rateLimit:cfg_show_rf_refresh_delay})}function ko_rebind_state(state,id_elto){if(typeof ko==="undefined"){return}if(typeof cfg_show_rf_refresh_delay==="undefined"){cfg_show_rf_refresh_delay=120}var state_obj=simhw_sim_state(state);if(typeof state_obj.value!=="function"){state_obj.value=ko.observable(state_obj.value).extend({rateLimit:cfg_show_rf_refresh_delay})}var ko_context=document.getElementById(id_elto);ko.cleanNode(ko_context);ko.applyBindings(simhw_sim_state(state),ko_context)}function show_rf_values(){return simcore_action_ui("CPU",0,"show_rf_values")()}function show_rf_names(){return simcore_action_ui("CPU",0,"show_rf_names")()}function show_states(){return simcore_action_ui("CPU",0,"show_states")()}function get_screen_content(){return simcore_action_ui("SCREEN",0,"get_screen_content")()}function set_screen_content(screen){simcore_action_ui("SCREEN",0,"set_screen_content")(screen)}function get_keyboard_content(){return simcore_action_ui("KBD",0,"get_keyboard_content")()}function set_keyboard_content(keystrokes){simcore_action_ui("KBD",0,"set_keyboard_content")(keystrokes)}function show_main_memory(memory,index,redraw,updates){return simcore_action_ui("MEMORY",0,"show_main_memory")(memory,index,redraw,updates)}function show_control_memory(memory,memory_dashboard,index,redraw){return simcore_action_ui("MEMORY",0,"show_control_memory")(memory,memory_dashboard,index,redraw)}function show_memories_values(){var pc_name=simhw_sim_ctrlStates_get().pc.state;var reg_pc=get_value(simhw_sim_state(pc_name));show_main_memory(simhw_internalState("MP"),reg_pc,true,true);var maddr_name=simhw_sim_ctrlStates_get().mpc.state;var reg_maddr=get_value(simhw_sim_state(maddr_name));show_control_memory(simhw_internalState("MC"),simhw_internalState("MC_dashboard"),reg_maddr,true)}function update_draw(obj,value){return simcore_action_ui("CPU",1,"update_draw")(obj,value)}function update_bus_visibility(bus_name,value){return simcore_action_ui("CPU",1,"update_bus_visibility")(bus_name,value)}function refresh(){for(var key in simhw_sim_signals()){update_draw(simhw_sim_signals()[key],simhw_sim_signals()[key].value);check_buses(key)}show_dbg_ir(get_value(simhw_sim_state("REG_IR_DECO")))}function show_dbg_ir(value){return simcore_action_ui("MEMORY",0,"show_dbg_ir")(value)}function show_dbg_mpc(){return simcore_action_ui("MEMORY",0,"show_dbg_mpc")()}function show_asmdbg_pc(){return simcore_action_ui("MEMORY",0,"show_asmdbg_pc")()}function ws_alert(msg){if(typeof document==="undefined"){console.log(msg);return true}alert(msg);return true}function simcore_init(with_ui){var ret={};ret.msg="";ret.ok=true;if(with_ui){restore_cfg()}else{reset_cfg_values()}return ret}function simcore_init_hw(simhw_name){var ret={};ret.msg="";ret.ok=true;var hwid=simhw_getIdByName(simhw_name);if(hwid<0){ret.msg="ERROR: unknown hardware: "+simhw_name+".<br>\n";ret.ok=false;return ret}simhw_setActive(hwid);var ret1=simcore_init_ui({});if(false===ret1.ok){ret.msg=ret.msg;ret.ok=false;return ret}return ret}function simcore_welcome(){var ret={};ret.msg="";ret.ok=true;console.log("");console.log("██╗    ██╗███████╗██████╗ ███████╗██╗███╗   ███╗");console.log("██║    ██║██╔════╝██╔══██╗██╔════╝██║████╗ ████║");console.log("██║ █╗ ██║█████╗  ██████╔╝███████╗██║██╔████╔██║");console.log("██║███╗██║██╔══╝  ██╔═══╝ ╚════██║██║██║╚██╔╝██║");console.log("╚███╔███╔╝███████╗██║     ███████║██║██║ ╚═╝ ██║");console.log(" ╚══╝╚══╝ ╚══════╝╚═╝     ╚══════╝╚═╝╚═╝     ╚═╝");console.log("");console.log("Stable: https://github.com/wepsim/wepsim");console.log("Beta:   https://github.com/acaldero/wepsim");console.log("");return ret}function simcore_init_ui(hash_detail2init){var ret={};ret.msg="";ret.ok=true;var detail_id=0;var sim_components=simhw_sim_components();for(var elto in sim_components){sim_components[elto].details_ui=[];for(var index in sim_components[elto].details_name){sim_components[elto].details_ui[index]={};detail_id=sim_components[elto].details_name[index];if(typeof hash_detail2init[detail_id]!=="undefined"){sim_components[elto].details_ui[index]=hash_detail2init[detail_id];sim_components[elto].details_ui[index].init()}}}return ret}function simcore_action_ui(component_name,detail_id,action_name){var sim_components=simhw_sim_components();if(typeof sim_components[component_name].details_ui[detail_id][action_name]==="undefined"){return simcore_do_nothing_handler}return sim_components[component_name].details_ui[detail_id][action_name]}function simcore_init_eventlistener(context,hash_detail2action,hash_signal2action){var context_obj=null;var r=[];var o=null;context_obj=document.getElementById(context).contentDocument;if(null==context_obj){console.log('warning: unreferenced graphic element context named "'+r[0]+'".');return}var sim_signals=simhw_sim_signals();for(var key in sim_signals){if(typeof hash_signal2action[key+"click"]==="undefined"){hash_signal2action[key+"click"]=function(key_value){return function(){hash_signal2action["<all>"](key_value,"click")}}(key)}if(typeof hash_signal2action[key+"dblclick"]==="undefined"){hash_signal2action[key+"dblclick"]=function(key_value){return function(){hash_signal2action["<all>"](key_value,"dblclick")}}(key)}for(var j=0;j<simhw_sim_signal(key).fire_name.length;j++){r=simhw_sim_signal(key).fire_name[j].split(":");if(r[0]!==context){continue}o=context_obj.getElementById(r[1]);if(null===o){console.log('warning: unreferenced graphic element named "'+r[0]+":"+r[1]+'".');continue}o.addEventListener("click",hash_signal2action[key+"click"],false);o.addEventListener("dblclick",hash_signal2action[key+"dblclick"],false)}}var sim_components=simhw_sim_components();for(var elto in sim_components){for(var index in sim_components[elto].details_name){var firename=sim_components[elto].details_name[index];if(typeof hash_detail2action[firename]==="undefined"){continue}for(var fireindex in sim_components[elto].details_fire[index]){r=sim_components[elto].details_fire[index][fireindex].split(":");if(r[0]!==context){continue}o=context_obj.getElementById(r[1]);if(null===o){console.log('warning: unreferenced graphic element named "'+r[0]+":"+r[1]+'".');continue}o.addEventListener("click",hash_detail2action[firename],false)}}}}function simcore_check_if_can_execute(){var ret={};ret.msg="";ret.ok=true;var curr_segments=simhw_internalState("segments");if(typeof curr_segments[".ktext"]=="undefined"&&typeof curr_segments[".text"]=="undefined"){ret.msg="code segment .ktext/.text does not exist!<br>\n"+"Please load some assembly code.<br>";ret.ok=false;return ret}var SIMWARE=get_simware();if(!(typeof curr_segments[".ktext"]!="undefined"&&SIMWARE.labels2.kmain)&&!(typeof curr_segments[".text"]!="undefined"&&SIMWARE.labels2.main)){ret.msg="labels 'kmain' (in .ktext) or 'main' (in .text) do not exist!";ret.ok=false;return ret}return ret}function simcore_check_if_can_continue2(reg_maddr,reg_pc){var ret={};ret.ok=true;ret.msg="";if(typeof simhw_internalState_get("MC",reg_maddr)=="undefined"){var hex_maddr="0x"+parseInt(reg_maddr).toString(16);ret.ok=false;ret.msg="Error: undefined microinstruction at "+hex_maddr+".";return ret}var curr_segments=simhw_internalState("segments");if(reg_pc<curr_segments[".ktext"].end&&reg_pc>=curr_segments[".ktext"].begin){return ret}if(reg_pc<curr_segments[".text"].end&&reg_pc>=curr_segments[".text"].begin){return ret}if(0!==reg_maddr){if(reg_pc==curr_segments[".ktext"].end||reg_pc==curr_segments[".text"].end){return ret}}ret.ok=false;ret.msg="The program has finished because the PC register points outside .ktext/.text code segments";return ret}function simcore_check_if_can_continue(){var pc_name=simhw_sim_ctrlStates_get().pc.state;var reg_pc=parseInt(get_value(simhw_sim_state(pc_name)));var maddr_name=simhw_sim_ctrlStates_get().mpc.state;var reg_maddr=get_value(simhw_sim_state(maddr_name));return simcore_check_if_can_continue2(reg_maddr,reg_pc)}function simcore_reset(){var ret={};ret.msg="";ret.ok=true;var SIMWARE=get_simware();var curr_firm=simhw_internalState("FIRMWARE");var curr_segments=simhw_internalState("segments");var sim_components=simhw_sim_components();var pc_name=simhw_sim_ctrlStates_get().pc.state;var pc_state=simhw_sim_state(pc_name);var sp_name=curr_firm.stackRegister;var sp_state=simhw_sim_states().BR[sp_name];for(var elto in sim_components){var reset_signal_name=sim_components[elto].name+"_RESET";compute_general_behavior(reset_signal_name)}if(typeof curr_segments[".ktext"]!=="undefined"&&SIMWARE.labels2.kmain){set_value(pc_state,parseInt(SIMWARE.labels2.kmain));show_asmdbg_pc()}else if(typeof curr_segments[".text"]!=="undefined"&&SIMWARE.labels2.main){set_value(pc_state,parseInt(SIMWARE.labels2.main));show_asmdbg_pc()}if(typeof curr_segments[".stack"]!=="undefined"&&typeof sp_state!=="undefined"){set_value(sp_state,parseInt(curr_segments[".stack"].end))}var new_maddr=get_value(simhw_sim_state("MUXA_MICROADDR"));if(typeof simhw_internalState_get("MC",new_maddr)!="undefined")var new_mins=simhw_internalState_get("MC",new_maddr);else var new_mins=simhw_sim_state("REG_MICROINS").default_value;if(typeof new_mins.NATIVE==="undefined"){compute_general_behavior("CLOCK")}show_dbg_ir(get_value(simhw_sim_state("REG_IR_DECO")));for(elto in sim_components){for(var index in sim_components[elto].details_name){if(typeof sim_components[elto].details_ui[index].reset!=="undefined"){sim_components[elto].details_ui[index].reset()}}}return ret}function simcore_execute_microinstruction(){var ret=simcore_check_if_can_continue();if(false===ret.ok){return ret}compute_general_behavior("CLOCK");show_states();show_rf_values();show_dbg_mpc();return ret}function simcore_execute_microinstruction2(reg_maddr,reg_pc){var ret=simcore_check_if_can_continue2(reg_maddr,reg_pc);if(false===ret.ok){return ret}compute_general_behavior("CLOCK");show_states();show_rf_values();show_dbg_mpc();return ret}function simcore_execute_microprogram(options){var ret=simcore_check_if_can_continue();if(false===ret.ok){return ret}var before_state=null;var after_state=null;var curr_mpc="";var curr_MC=simhw_internalState("MC");var maddr_name=simhw_sim_ctrlStates_get().mpc.state;var maddr_state=simhw_sim_state(maddr_name);if(typeof options.before_microinstruction==="undefined"){options.before_microinstruction=simcore_do_nothing_handler}if(typeof options.after_microinstruction==="undefined"){options.after_microinstruction=simcore_do_nothing_handler}var i_clks=0;var limitless=options.cycles_limit<0;var cur_addr=0;do{options.before_microinstruction(curr_MC,cur_addr);compute_general_behavior("CLOCK");i_clks++;options.after_microinstruction(curr_MC,cur_addr);if(limitless===false&&i_clks>=options.cycles_limit){ret.msg="Warning: clock cycles limit reached in a single instruction.";ret.ok=false;break}cur_addr=get_value(maddr_state);if(typeof curr_MC[cur_addr]=="undefined"){ret.msg="Error: undefined microinstruction at "+cur_addr+".";ret.ok=false;break}}while(i_clks<options.cycles_limit&&0!=cur_addr);if(true==ret.ok&&typeof curr_MC[cur_addr].NATIVE!=="undefined"){compute_general_behavior("CLOCK")}show_states();show_rf_values();if(get_cfg("DBG_level")=="microinstruction"){show_dbg_mpc()}return ret}function simcore_execute_program(options){var ret={};ret.ok=true;ret.msg="";var curr_segments=simhw_internalState("segments");var pc_name=simhw_sim_ctrlStates_get().pc.state;var pc_state=simhw_sim_state(pc_name);var reg_pc=get_value(pc_state);var reg_pc_before=get_value(pc_state)-4;var code_begin=0;if(typeof curr_segments[".text"]!="undefined"&&typeof curr_segments[".text"].begin!="undefined")code_begin=parseInt(curr_segments[".text"].begin);var code_end=0;if(typeof curr_segments[".text"]!="undefined"&&typeof curr_segments[".text"].end!="undefined")code_end=parseInt(curr_segments[".text"].end);var kcode_begin=0;if(typeof curr_segments[".ktext"]!="undefined"&&typeof curr_segments[".ktext"].begin!="undefined")kcode_begin=parseInt(curr_segments[".ktext"].begin);var kcode_end=0;if(typeof curr_segments[".ktext"]!="undefined"&&typeof curr_segments[".ktext"].end!="undefined")kcode_end=parseInt(curr_segments[".ktext"].end);var ret1=null;var before_state=null;var after_state=null;var curr_pc="";var SIMWARE=get_simware();if(typeof options.verbalize!=="undefined"){set_cfg("verbal_verbose",options.verbalize)}if(typeof options.before_instruction==="undefined"){options.before_instruction=simcore_do_nothing_handler}if(typeof options.after_instruction==="undefined"){options.after_instruction=simcore_do_nothing_handler}var ins_executed=0;while(reg_pc<code_end&&reg_pc>=code_begin||reg_pc<kcode_end&&reg_pc>=kcode_begin){options.before_instruction(SIMWARE,reg_pc);ret1=simcore_execute_microprogram(options);if(false===ret1.ok){return ret1}options.after_instruction(SIMWARE,reg_pc);ins_executed++;if(ins_executed>options.instruction_limit){ret.ok=false;ret.msg="more than "+options.instruction_limit+" instructions executed before application ends.";return ret}reg_pc_before=reg_pc;reg_pc=get_value(pc_state)}return ret}function simcore_do_nothing_handler(){return null}function simcore_compile_firmware(textToMCompile){var ret={};ret.msg="";ret.ok=true;if(""==textToMCompile){ret.msg="Empty Firmware";ret.ok=false;return ret}var preSM=null;try{preSM=loadFirmware(textToMCompile);ret.simware=preSM}catch(e){ret.msg="ERROR: at line: "+e.lineNumber+" and column: "+e.columnNumber;ret.ok=false;return ret}if(preSM.error!=null){ret.msg=preSM.error;ret.ok=false;return ret}update_memories(preSM);simcore_reset();return ret}function simcore_compile_assembly(textToCompile){var ret={};ret.msg="";ret.ok=true;var SIMWARE=get_simware();if(SIMWARE.firmware.length===0){ret.msg="Empty microcode, please load the microcode first.";ret.ok=false;return ret}var SIMWAREaddon=simlang_compile(textToCompile,SIMWARE);ret.simware=SIMWAREaddon;if(SIMWAREaddon.error!=null){ret.msg=SIMWAREaddon.error;ret.ok=false;return ret}set_simware(SIMWAREaddon);update_memories(SIMWARE);simcore_reset();return ret}function simcore_hardware_export(hw_name){var ret={};ret.msg="{}";ret.ok=false;var hw_obj=simhw_getObjByName(hw_name);if(null===hw_obj){return ret}ret.ok=true;ret.msg=JSON.stringify(hw_obj,(function(key,value){if(typeof value==="function"){return"/Function("+value.toString()+")/"}return value}));return ret}function simcore_hardware_import(hw_json){var ret={};ret.msg="";ret.ok=true;hw_obj=JSON.parse(hw_json,(function(key,value){if(typeof value==="string"&&value.startsWith("/Function(")&&value.endsWith(")/")){value=value.substring(10,value.length-2);return eval("("+value+")")}return value}));simhw_add(hw_obj);return ret}function simcore_native_get_signal(elto){return get_value(simhw_sim_signal(elto))>>>0}function simcore_native_set_signal(elto,value){set_value(simhw_sim_signal(elto),value);compute_behavior("FIRE "+elto);return value}function simcore_native_get_value(component,elto){var index=0;var sim_components=simhw_sim_components();var compo_index=component;if("BR"===component)compo_index="CPU";if("DEVICE"===component)compo_index="IO";if(typeof sim_components[compo_index].get_value!=="undefined")return sim_components[compo_index].get_value(elto);return false}function simcore_native_set_value(component,elto,value){var index=0;var sim_components=simhw_sim_components();var compo_index=component;if("BR"===component)compo_index="CPU";if("DEVICE"===component)compo_index="IO";if(typeof sim_components[compo_index].set_value!=="undefined")return sim_components[compo_index].set_value(elto,value);return false}function simcore_native_get_fields(signature_raw){var SIMWARE=get_simware();for(var key in SIMWARE.firmware){if(SIMWARE.firmware[key].signatureRaw===signature_raw){return SIMWARE.firmware[key].fields}}}function simcore_native_get_field_from_ir(fields,index){if(typeof fields[index]==="undefined")return false;var value=get_value(simhw_sim_state("REG_IR"));var left_shift=31-parseInt(fields[index].startbit);var right_shift=parseInt(fields[index].stopbit);value=value<<left_shift;value=value>>>left_shift;value=value>>>right_shift;return value}function simcore_native_deco(){compute_behavior("DECO")}function simcore_native_go_maddr(maddr){set_value(simhw_sim_state("MUXA_MICROADDR"),maddr)}function simcore_native_go_opcode(){var maddr=get_value(simhw_sim_state("ROM_MUXA"));set_value(simhw_sim_state("MUXA_MICROADDR"),maddr)}function simcore_native_go_instruction(signature_raw){var SIMWARE=get_simware();for(var key in SIMWARE.firmware){if(SIMWARE.firmware[key].signatureRaw===signature_raw){var maddr=SIMWARE.firmware[key]["mc-start"];set_value(simhw_sim_state("MUXA_MICROADDR"),maddr);return}}}function simcore_simstate_checklist2state(checklist){var o={};var ret=false;checklist=checklist.replace(/;|==|!=|>=|<=|=|>|</gi,(function(x){return" "+x+" "}));checklist=checklist.replace(/  /g," ");var lines=checklist.split(";");for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(""===line)continue;var parts=line.split(" ");if(parts.length<4)continue;var check={type:parts[0],id:parts[1],condition:parts[2],value:decodeURI(parts[3])};for(var index in simhw_sim_components()){ret=simhw_sim_component(index).read_state(o,check);if(true===ret)break}if(false===ret)console.log("ERROR in checklist at component "+check.type+": "+line)}return o}function simcore_simstate_current2state(){var o={};for(var index in simhw_sim_components()){simhw_sim_component(index).write_state(o)}return o}function simcore_simstate_state2checklist(s_obj){var ret="";for(var component in s_obj){for(var eltos in s_obj[component]){var elto=s_obj[component][eltos];ret=ret+elto.type+" "+elto.id+" "+elto.op+" "+encodeURI(elto.value)+"; "}}return ret}function simcore_simstate_check_results(expected_result,obtained_result,newones_too){var d={};d.result=[];d.errors=0;d.neltos_expected=0;d.neltos_obtained=0;var elto=null;var diff={};var obtained_value=0;for(var compo in simhw_sim_components()){if(typeof expected_result[compo]!="undefined"){for(elto in expected_result[compo]){d.neltos_expected++;obtained_value=expected_result[compo][elto].default_value;if(typeof obtained_result[compo]!="undefined"&&typeof obtained_result[compo][elto]!="undefined"){obtained_value=obtained_result[compo][elto].value}diff={};diff.expected=expected_result[compo][elto].value;diff.obtained=obtained_value;diff.elto_type=compo.toLowerCase();diff.elto_id=expected_result[compo][elto].id;diff.elto_op=expected_result[compo][elto].op;diff.fulfill=false;if("="===expected_result[compo][elto].op)diff.fulfill=parseInt(diff.obtained)==parseInt(diff.expected);else if(">"===expected_result[compo][elto].op)diff.fulfill=parseInt(diff.obtained)>parseInt(diff.expected);else if("<"===expected_result[compo][elto].op)diff.fulfill=parseInt(diff.obtained)<parseInt(diff.expected);else if(">="===expected_result[compo][elto].op)diff.fulfill=parseInt(diff.obtained)>=parseInt(diff.expected);else if("<="===expected_result[compo][elto].op)diff.fulfill=parseInt(diff.obtained)<=parseInt(diff.expected);else if("=="===expected_result[compo][elto].op)diff.fulfill=diff.expected==diff.obtained;else if("!="===expected_result[compo][elto].op)diff.fulfill=diff.expected!=diff.obtained;d.result.push(diff);if(diff.fulfill===false)d.errors++}}if(newones_too&&typeof obtained_result[compo]!="undefined"){for(elto in obtained_result[compo]){d.neltos_obtained++;if(typeof expected_result[compo]!="undefined"&&typeof expected_result[compo][elto]!="undefined"){continue}diff={};diff.expected=obtained_result[compo][elto].default_value;diff.obtained=obtained_result[compo][elto].value;diff.fulfill=diff.expected===diff.obtained;diff.elto_type=compo.toLowerCase();diff.elto_id=obtained_result[compo][elto].id;diff.elto_op="=";d.result.push(diff);if(diff.fulfill===false)d.errors++}}}return d}function simcore_simstate_diff_results(expected_result,obtained_result){return simcore_simstate_check_results(expected_result,obtained_result,true)}function simcore_simstate_diff_states(before_state_obj,after_state_obj){var before_arr=simcore_simstate_state2checklist(before_state_obj).split(";");var after_arr=simcore_simstate_state2checklist(after_state_obj).split(";");return after_arr.filter((function(elto){return!before_arr.includes(elto)})).join(";").trim()}function simcore_simstate_checkreport2txt(checklist){var o="";for(var i=0;i<checklist.length;i++){if(checklist[i].fulfill===false){o+=checklist[i].elto_type+"["+checklist[i].elto_id+"]='"+checklist[i].obtained+"' (expected '"+checklist[i].expected+"'), "}}return o}function simcore_simstate_checkreport2html(checklist,only_errors){var o="";var color="green";if(typeof only_errors==="undefined")only_errors=false;o+="<table style='margin:0 0 0 0;' "+"       class='table table-hover table-bordered table-sm'>"+"<thead>"+"<tr>"+"<th>Type</th>"+"<th><span class='d-none d-sm-inline-flex'>Identification</span><span class='d-sm-none'>Id.</span></th>"+"<th><span class='d-none d-sm-inline-flex'>Values in the</span> clipboard <span class='d-none d-sm-inline-flex'>state</th>"+"<th><span class='d-none d-sm-inline-flex'>Values in the</span> selected <span class='d-none d-sm-inline-flex'>state</th>"+"</tr>"+"</thead>"+"<tbody>";for(var i=0;i<checklist.length;i++){if(checklist[i].fulfill===false)color="table-danger";else color="table-success";if(only_errors&&checklist[i].fulfill)continue;o+="<tr class="+color+">"+"<td>"+checklist[i].elto_type+"</td>"+"<td>"+checklist[i].elto_id+"</td>"+"<td>"+checklist[i].elto_op+"&nbsp;"+checklist[i].expected+"</td>"+"<td>"+checklist[i].obtained+"</td>"+"</tr>"}o+="</tbody>"+"</table>";return o}function simcore_voice_canSpeak(){if(typeof window.speechSynthesis=="undefined"){return false}if(false===get_cfg("use_voice")){return false}return true}function simcore_voice_speak(msg){var ssu=null;if(simcore_voice_canSpeak()){ssu=new SpeechSynthesisUtterance(msg);ssu.lang="es-ES";if("en"==get_cfg("ws_idiom"))ssu.lang="en-US";if("es"==get_cfg("ws_idiom"))ssu.lang="es-EN";window.speechSynthesis.speak(ssu)}}function simcore_voice_stopSpeak(){if(simcore_voice_canSpeak()){window.speechSynthesis.cancel()}}var simcore_rest={};function simcore_rest_reset(){simcore_rest={}}function simcore_rest_add(name,description){simcore_rest[name]={endpoint:description.endpoint,user:description.user,pass:description.pass,last_request:null}}function simcore_rest_list(){return simcore_rest}function simcore_rest_get(name){return simcore_rest[name]}function simcore_rest_call(name,method,uri,data){var rest_info=simcore_rest[name];if(typeof rest_info==="undefined"){return false}var api_endpoint=rest_info.endpoint;if(typeof api_endpoint=="function"){api_endpoint=api_endpoint()}if(api_endpoint.trim()===""){return false}var basic_auth="Basic "+btoa(rest_info.user+":"+rest_info.pass);var enc_data=JSON.stringify(data);var request={url:api_endpoint+uri,type:method,contentType:"application/json",accepts:"application/json",cache:false,dataType:"json",data:enc_data,beforeSend:function(xhr){if(rest_info.user.trim()!==""){xhr.setRequestHeader("Authorization",basic_auth)}},error:function(jqXHR){console.log("ajax error "+jqXHR.status)}};rest_info.last_request=$.ajax(request);return true}var simcore_notifications=[];function simcore_notifications_get(){return simcore_notifications}function simcore_notifications_reset(){simcore_notifications=[]}function simcore_notifications_add2(ntf){simcore_notifications.push({title:ntf.title,message:ntf.message,type:ntf.type,date:ntf.date})}function simcore_notifications_add(ntf_title,ntf_message,ntf_type,ntf_delay){simcore_notifications.push({title:$("<p>").html(ntf_title).text(),message:$("<p>").html(ntf_message).text(),type:ntf_type,date:(new Date).getTime()})}var i18n={lang:{en:"English",es:"Espa&ntilde;ol",it:"L'italiano - Google-translate",kr:"한국어 - Google-translate",hi:"हिन्दी - Google-translate",fr:"Fran&ccedil;ais - Google-translate",pt:"Portugu&ecirc;s - Google-translate",ja:"日本語 - Google-translate",zh_cn:"汉语 - Google-translate",ru:"русский язык - Google-translate",sv:"Svenska - Google-translate",de:"Deutsch - Google-translate"},eltos:{gui:{},cfg:{},examples:{},states:{},help:{},dialogs:{},tutorial_welcome:{},tutorial_simpleusage:{},tour_intro:{}}};function i18n_init(){for(var l in i18n.lang){for(var e in i18n.eltos){i18n.eltos[e][l]={}}}return true}i18n_init();function i18n_update_tags(component){var ws_idiom=get_cfg("ws_idiom");i18n_update_tagsFor(component,ws_idiom)}function i18n_update_tagsFor(component,lang){if(typeof i18n.eltos[component]=="undefined"){return}var tags=document.querySelectorAll("span");Array.from(tags).forEach((function(value,index){var key=value.dataset.langkey;if(i18n.eltos[component][lang][key]){value.innerHTML=i18n.eltos[component][lang][key]}}))}function i18n_get(component,lang,key){if(typeof i18n.eltos[component]==="undefined"){return key}var translation=i18n.eltos[component][lang][key];if(typeof translation==="undefined"){return key}return translation}function i18n_get_TagFor(component,key){var ws_idiom;try{ws_idiom=get_cfg("ws_idiom")}catch(e){ws_idiom="en"}var translation=key;if(typeof i18n.eltos[component][ws_idiom][key]!=="undefined"){translation=i18n.eltos[component][ws_idiom][key]}return translation}function i18n_get_select(div_name,str_onchange){var curr_val=get_cfg("ws_idiom");var o=" <select name='"+div_name+"' id='"+div_name+"' "+"         class='form-control form-control-sm custom-select'"+"\t   aria-label='idiom for examples and help' "+"\t   onchange=\"var opt = $(this).find('option:selected');"+"\t \t      var optValue = opt.val();"+"\t\t      update_cfg('ws_idiom', optValue);"+"                    i18n_update_tagsFor('gui',      optValue); "+"                    i18n_update_tagsFor('dialogs',  optValue); "+str_onchange+'                    return true; "'+"\t   data-native-menu='false'>";for(var l in i18n.lang){if(curr_val==l)o+="\t<option value='"+l+"' selected>"+i18n.lang[l]+"</option>";else o+="\t<option value='"+l+"'>"+i18n.lang[l]+"</option>"}o+=" </select>";return o}function i18n_get_selectcfg(){var o=" <select name='select7' id='select7' class='form-control form-control-sm custom-select'"+"\t     aria-label='idiom for examples and help' "+"\t     onchange=\"var opt = $(this).find('option:selected');"+"\t \t        var optValue = opt.val();"+"\t\t        update_cfg('ws_idiom', optValue);"+"                      i18n_update_tagsFor('gui', optValue);"+"                      i18n_update_tagsFor('cfg', optValue);"+'\t\t        return true;"'+"\t     data-native-menu='false'>";for(var l in i18n.lang){o+="\t<option value='"+l+"'>"+i18n.lang[l]+"</option>"}o+=" </select>";return o}function i18n_get_welcome(){var o='<div  class="container">'+'<span class="row">';for(var key in i18n.lang){o+='<a class="btn btn-sm btn-outline-dark mx-2 my-2 col-auto" href="#" '+"   onclick=\"wepsim_newbie_tour_reload('"+key+"');\">"+i18n_get("gui",key,"Welcome")+"</a>"}o+="</span>"+"</div>";return o}i18n.eltos.gui.es={"Loading WepSIM...":"Cargando WepSIM...",Configuration:"Configuraci&oacute;n",MicroCode:"MicroC&oacute;digo",Assembly:"Ensamblador",Simulator:"Simulador",Examples:"Ejemplos",Load:"Cargar",Save:"Guardar","Load/Save":"Cargar/Guardar",Restore:"Restaurar",Help:"Ayuda",Notifications:"Notificaciones",RecordBar:"Grabaci&oacute;n",Input:"Entrada",Output:"Salida","Help Index":"&Iacute;ndice ayuda",Processor:"Procesador","Assembly Debugger":"Depurador de Ensamblador",Reset:"Reiniciar",microInstruction:"&#181;Instrucci&oacute;n",Instruction:"Instrucci&oacute;n",Run:"Ejecutar","Hardware Summary":"Hardware Resumido",processor:"procesador",details:"detalles",microcode:"microc&oacute;digo",Signals:"Se&ntilde;ales",Behaviors:"Comportamientos",States:"Estados","Control States":"Estados de Control",Dependencies:"Dependencias",Close:"Cerrar",Description:"Descripci&oacute;n",Show:"Mostrar","Show Main Memory":"Mostrar Memoria Principal",compile:"compilar",Compile:"Compilar","Please write the file name":"Por favor indique el nombre de fichero","Load from this File":"Cargar de este fichero",labels:"etiquetas",addr:"dir",ess:"ecci&oacute;n",content:"contenido",assembly:"ensamblador",instructions:"instrucciones","simulator intro 1":"Puede seleccionar el hardware que se utilizar&aacute;. El predeterminado es el hardware EP (Elemental Processor). <br> Puede usar <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">el selector de modo</span> para cambiar el hardware utilizado","simulator intro 2":"A continuaci&oacute;n necesita cargar el microc&oacute;digo (define el conjunto de instrucciones) y el c&oacute;digo de ensamblador. <br> Puede usar <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'>un ejemplo</span>, <span class='text-primary bg-light' onclick='wsweb_select_action(\"checkpoint\");;'>cargarlo desde un archivo</span>, o puede editar <span class='text-primary bg-light' onclick='wsweb_change_workspace_microcode();'>un nuevo microc&oacute;digo</span> y <span class='text-primary bg-light' onclick='wsweb_change_workspace_assembly();'>un nuevo c&oacute;digo de ensamblador</span>.","simulator intro 3":"Finalmente, en el simulador puede ejecutar el microc&oacute;digo m&aacute;s el ensamblador cargado antes. <br> Puede ejecutar ambos, en el nivel de microinstrucci&oacute;n o en el nivel de instrucci&oacute;n de ensamblador.","Prev.":"Anterior",Next:"Siguiente",End:"Fin","Disable tutorial mode":"Deshabilitar modo tutorial",Comment:"Comentar",Pause:"Pausar",Play:"Reproducir",Stop:"Parar",Record:"Grabar",Registers:"Registros","Control Memory":"Memoria de Control",Stats:"Estad&iacute;sticas",Memory:"Memoria","Keyboard+Display":"Teclado+Pantalla","I/O Stats":"E/S Estad&iacute;sticas","I/O Configuration":"E/S Configuraci&oacute;n",Recent:"Reciente",Refresh:"Refrescar",Welcome:"Bienvenido+a","Microcode & Assembly":"WepSIM hardware","Pick firm/soft":"Firm/soft desde",Information:"Informaci&oacute;n",Native:"Nativo","MIPS32-like":"Basado en MIPS32",RISCV32:"RISCV32","Z80-like":"Basado en Z80",_last_:"_last_"};i18n.eltos.tutorial_welcome.es={title_0:"¡Bienvenidos al simulador WepSIM!",message_0:"<center><img alt='wepsim screenshot' src='images/simulator/simulator012.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"Este breve tutorial le mostrar&aacute;:"+"<ol>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,1);'>Carga de un ejemplo.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,2);'>Ejecución de ejemplo.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,3);'>Configuraci&oacute;n del simulador.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,4);'>Obtener ayuda.</a></li>"+"</ol>"+"</h5>",title_1:"C&oacute;mo cargar algunos ejemplos.",message_1:"<center><img alt='wepsim screenshot' src='images/welcome/example_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Haga click en el bot&oacute;n de 'examples' y haga click en el 't&iacute;tulo' del ejemplo que desea cargar."+"<br>"+"</h5>",title_2:"C&oacute;mo cargar algunos ejemplos.",message_2:"<center><img alt='wepsim screenshot' src='images/welcome/simulation_xinstruction.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Haga click en next instruction/microinstruction para ejecutar paso a paso. <br>"+"Haga click en run para ejecutar hasta el primer punto de ruptura o el fin del programa en ensamblador."+"<br>"+"</h5>",title_3:"C&oacute;mo configurar WepSIM.",message_3:"<center><img alt='wepsim screenshot' src='images/welcome/config_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Haga click en el bot&oacute;n de configuraci&oacute;n para configurar diversos aspectos de WepSIM para su comididad."+"<br>"+"</h5>",title_4:"C&oacute;mo conseguir la ayuda b&aacute;sica.",message_4:"<center><img alt='wepsim screenshot' src='images/welcome/help_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Haga click en el bot&oacute;n verde de ayuda 'help'.<br>"+"Puede obtener la ayuda en Spanish/English, ir al &iacute;ndice de la ayuda o cerrar la pantalla de ayuda."+"<br>"+"</h5>",title_5:"¡Bienvenido a WepSIM!",message_5:"<center><img alt='wepsim screenshot' src='images/welcome/help_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Por favor explorer las secciones de la ayuda para m&aacute;s informaci&oacute;n. <br>"+"Si hace click en el bot&oacute;n 'end' del tutorial entonces WepSIM cargar&aacute; el primer ejemplo por usted. ¡Diviertase aprendiendo!"+"<br>"+"</h5>"};i18n.eltos.tutorial_simpleusage.es={title_0:"WepSIM: microprogramar, ensamblar y simular",message_0:"<center><img alt='wepsim screenshot' src='images/simulator/simulator011.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"Este breve tutorial le mostrar&aacute;:"+"<ol>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,1);'>La edici&oacute;n de microc&oacute;digo.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'>La edici&oacute;n de c&oacute;digo ensamblador.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,5);'>Ejecución del anterior ensamblador definido anteriormente.</a></li>"+"</ol>"+"</h5>",title_1:"WepSIM: microprogramar, ensamblar y simular",message_1:"<center><img alt='wepsim screenshot' src='images/simulator/firmware001.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"El primer paso es microprogramar el firmware a ser usado. "+"Por favor use el bot&oacute;n de 'Microcode' para ir a la pantalla de trabajo del microc&oacute;digo."+"</h5>",title_2:"WepSIM: microprogramar, ensamblar y simular",message_2:"<center><img alt='wepsim screenshot' src='images/simulator/firmware002.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"La pantalla de microprogramación ofrece:"+"<ul>"+"<li>El editor de microcr&oacute;digo.</li>"+"<li>El microcompilador.</li>"+"<li>El resumen del hardware y la ayuda.</li>"+"</ul>"+"Una vez que el microc&oacute;digo est&eacute; listo (editado y compile sin errores) el siguiente paso el el c&oacute;digo ensamblador."+"</h5>",title_3:"WepSIM: microprogramar, ensamblar y simular",message_3:"<center><img alt='wepsim screenshot' src='images/simulator/assembly002b.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"El segundo paso es programar el ensamblador a ser ejecutado. "+"Por favor use el bot&oacute;n de 'Assembly' para ir a la pantalla de ensamblador."+"</h5>",title_4:"WepSIM: microprogramar, ensamblar y simular",message_4:"<center><img alt='wepsim screenshot' src='images/simulator/assembly003.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"La pantalla de programaci&oacute;n en ensamblador ofrece:"+"<ul>"+"<li>El editor para el c&oacute;digo ensamblador.</li>"+"<li>El compilador de ensamblador.</li>"+"<li>El visualizador de mapa de memoria y ayuda.</li>"+"</ul>"+"Asegure antes de ir a la pantalla del simulador que su c&oacute;digo este listo (editado y compilado sin errores)."+"</h5>",title_5:"WepSIM: microprogramar, ensamblar y simular",message_5:"<center><img alt='wepsim screenshot' src='images/simulator/simulator010.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"El tercer paso es ejecutar el c&oacute;digo ensamblador en el ensamblador.<br>"+"La pantalla de simulación ofrece:"+"<ul>"+"<li>Las vista de ensamblador y hardware.</li>"+"<li>Los detalles de registros, memoria de control, memoria principal, etc.</li>"+"<li>Las acciones de reinicio, ejecución paso a paso o hasta punto de ruptura (o fin).</li>"+"</ul>"+"Este tutorial ha introducido el uso t&iacute;pico de WepSIM para estudiantes y profesores. ¡Disfrute con WepSIM!."+"</h5>"};i18n.eltos.tour_intro.es={step1:"WepSIM ayudar&aacute; a entender mejor c&oacute;mo funciona un computador: "+"es visual, interactivo, integra interrupciones, llamadas al sistema, etc. <br>"+"<br>"+"Nosotros realmente creemos que WepSIM es una herramienta revolucionaria. "+"Este breve tour le muestra las partes clave de la interfaz de WepSIM.",step2:"En la esquina superior derecha est&aacute; el selector de 'modo de ejecuci&oacute;n'.<br>"+"<br>"+"Los usuarios pueden seleccionar:"+"<ul>"+"<li>El hardware con el que trabajar (ejemplo: procesador EP, POC, etc.)</li>"+"<li>El modo solo ensamblador, con instrucciones MIPS<sub>32</sub> de enteros o RISC-V<sub>32</sub></li>"+"<li>El tutorial inicial, recomendado para principiantes ;-)</li>"+"</ul>",step3:"En la esquina superior derecha el bot&oacute;n de ayuda abre el panel de ayuda asociado.<br>"+"<br>"+"El cuadro de di&aacute;logo permite el acceso a tutoriales, informaci&oacute;n, etc.",step4:"En la esquina superior izquierda, el bot&oacute;n de 'ejemplos' abre el panel asociado.<br>"+"<br>"+"Hay muchos ejemplos muy &uacute;tiles para el aprendizaje incremental.",step5:"En la esquina superior izquierda est&aacute; el bot&oacute;n de configuracion que abre el cuadro de di&aacute;logo de la configuraci&oacute;n.<br>"+"<br>"+"Con la configuraci&oacute;ón se puede adaptar distintos aspectos de ejecuci&oacute;n, interfaz de usuario/a, preferencias, etc.",step6:"¡Felicidades!. Ya conoce las partes clave de la interfaz de WepSIM.<br>"+"Desde el panel de 'Ayuda' puede acceder al 'Tutorial de bienvenida'. para continuar aprendiendo.<br>"};i18n.eltos.cfg.es={General:"General","Idiom for help, examples, etc.":"Idioma para ayuda, ejemplos, etc.","Notification speed: time before disapear":"Velocidad en notificaciones: tiempo en desaparecer",Editor:"Editor","Editor theme: light or dark":"Tema de editor: claro u oscuro",Light:"Claro",Dark:"Oscuro","Editor mode: vim, emacs, etc.":"Modo de edici&oacute;n: vim, emacs, etc.",Execution:"Ejecuci&oacute;n","Running speed: execution speed":"Velocidad de ejecuci&oacute;n",Slow:"Lento",Normal:"Normal",Fast:"Veloz","Step-by-step: element in run mode":"Paso-a-paso: elemento a ejecutar de uno a uno",Instructions:"Instrucciones",Instruction:"Instrucci&oacute;n","&#181;instructions":"&#181;instrucciones",microInstruction:"&#181;Instrucci&oacute;n","Breakpoint icon: icon to be used for breakpoints":"Icono a ser usado en puntos de ruptura","Limit instructions: number of instructions to be executed":"L&iacute;mite instrucciones: n&uacute;mero de instrucciones a ser ejecutadas","Limit instruction ticks: to limit clock ticks":"L&iacute;mite ticks: limitaci&oacute;n de ticks de reloj por instrucci&oacute;n","Register file":"Banco de registros","Display format":"Formato de presentaci&oacute;n","Register file names":"Nombre de los registros",Numbers:"N&uacute;meros",Labels:"Etiquetas","Editable registers: edit register file values":"Registros editables: editar los valores de los registros","Circuitry simulation":"Circuiter&iacute;a","Data-path color":"Color del camino de datos","Signal color":"Color de las seńales activas","Show by value or by activation":"Mostrar por valor o por activaci&oacute;n",Value:"Valor",Activation:"Activaci&oacute;n","Interactive mode: signal value can be updated":"Modo interactivo: valores de las seńales puede actualizarse","Quick interactive mode: quick update of signal value":"Modo interactivo-r&aacute;pido: actualizaci&oacute;n r&aacute;pida de valores de seńales","(example)":"(ejemplo)",Accesibility:"Accesibilidad","Active voice: external voice control":"Activar voz: control por voz (externo)","Verbalization: textual or mathematical":"Tipo de verbalizar: texto o matem&aacutre;tica","WepSIM User Interface views":"Vistas de la Interfaz de Usuarios+as"};i18n.eltos.help.es={"Welcome tutorial":"Tutorial de bienvenida",help_01_01:"Abre el tutorial de bienvenida","Simple usage tutorial":"Tutorial simple de uso",help_01_02:"Tutorial de uso simple, ejemplo b&aacute;sico para microprogramar y programar en ensamblador","Execute example":"Ejecuci&oacute;n de ejemplo",help_01_03:"Reproduce el tutorial de ejecuci&oacute;n de ejemplo","Simulator: firmware":"Simulador: microc&oacute;digo",help_02_01:"Descripci&oacute;n de c&oacute;mo trabajar en el simulador con el microc&oacute;digo","Microcode format":"Formato del microc&oacute;digo",help_02_02:"Sint&aacute;xis del microc&oacute;digo usado","Simulator: assembly":"Simulador: ensamblador",help_02_03:"Descripci&oacute;n de c&oacute;mo trabajar en el simulador con el ensamblador","Assembly format":"Formato del ensamblador",help_02_04:"Sint&aacute;xis del ensamblador","Simulator: execution":"Simulador: ejecuci&oacute;n",help_02_05:"Descripci&oacute;n de c&oacute;mo ejecutar en el simulador el ensamblador y microc&oacute;digo","Simulated architecture":"Arquitectura del simulador",help_03_01:"Descripci&oacute;n de la arquitectura del procesador simulado","Simulated signals":"Señales simuladas",help_03_02:"Resumen de las señales principales del procesador elemental","Hardware summary":"Resumen del Hardware",help_03_03:"Resumen del hardware del procesador elemental simulado","License, platforms, etc.":"Licencia, plataformas, etc.",help_04_01:"Licencia de WepSIM, plataformas disponibles, tecnolog&iacute;as usadas",Authors:"Autores",help_04_02:"Autores de WepSIM"};i18n.eltos.states.es={States:"Estados",Current:"Actual","Current State":"Estado Actual",History:"Historia",None:"Ninguno","Empty history":"Historia vac&iacute;a","Empty (only modified values are shown)":"Vac&iacute;o (solo se muestra los valores modificados)",Differences:"Diferencias","differences with clipboard state":"diferencias con estado en portapapeles","Meets the specified requirements":"Iguales (cumple los requisitos)",history:"historial",Add:"A&ntilde;adir","'Current State' to History":"'Estado Actual' al historial",Check:"Comprobar",Copy:"Copiar","to clipboard":"al portapapeles",Checkpoint:"Checkpoint","File name":"Nombre de fichero","Tag for checkpoint":"Etiqueta para checkpoint","File to be loaded":"Fichero a cargar","Save to File":"Guardar a fichero","State(s) to checkpoint":"Estados para checkpoint","Record to checkpoint":"Grabaci&oacute;n para checkpoint","Browser cache":"Cache navegador","Session to be restore":"Sesi&oacute;n a restaurar",_last_:"_last_"};i18n.eltos.examples.es={"addv + seqv.":"addv + seqv.","Alloc.s":"Alloc.s","Dummy instruction":"Instrucci&oacute;n vac&iacute;a",Exception:"Excepci&oacute;n",Instructions:"Instrucciones",Interruptions:"Interrupciones","Int. + syscall + except.":"Int. + syscall + excep.","I/O":"E/S",Looping:"Blucles","madd, mmul, mxch":"madd, mmul, mxch","Masks & shift":"M&aacute;scaras y desplazamientos",Matrix:"Matriz","Memory access":"Acceso a memoria","SC 1, 4-5, 8, 11-12":"SC 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"Subrutina","syscall 1, 4-5, 8, 11-12":"syscall 1, 4-5, 8, 11-12","System call":"Llamada a systema",Threads:"Hilos",Vector:"Vector","Compiler Explorer":"Compiler Explorer",example_04_01:"Ejemplo avanzado con interrupciones, llamada al sistema y excepciones.",example_05_01:"Extensiones Espec&iacute;ficas de Aplicaci&oacute;n: addv + seqv.",example_05_03:"Extensiones Espec&iacute;ficas de Aplicaci&oacute;n: madd + mmul + mxch.",example_05_02:"Extensiones Espec&iacute;ficas de Aplicaci&oacute;n: strlen_2 + skipasciicode_2.",example_03_01:"Ejemplo <b>Instructive</b> con excepci&oacute;n de coma flotante.",example_03_02:"Ejemplo <b>Instructive</b> con interrupciones: fetch, RETI y .ktext/.kdata.",example_03_03:"Ejemplo <b>Instructive</b> con llamada al sistema.",example_04_04:"Examplo de malloc + free.",example_04_02:"Examplo de llamada a sistema para imprimir/leer enteros y string.",example_04_03:"Examplo de hilos.",example_03_01b:"Examplo con excepci&oacute;n de coma flotante.",example_03_02b:"Examplo con interrupciones: fetch, RETI y .ktext/.kdata.",example_02_01:"Examplo con acceso con E/S programada y segmento de .text/.data b&aacute;sico.",example_03_03b:"Examplo con llamada a sistema.",example_02_02:"Ejemplo extendido con m&aacute;s instrucciones y E/S (teclado y pantalla).",example_02_04:"Ejemplo extendido con subrutina y matriz.",example_02_03:"Ejemplo extendido con m&aacute;scaras, desplazamiento y segmentos b&aacute;sicos.",example_01_01:"Ejemplo simple con fetch, instrucciones artim&eacute;ticas y segmentos b&aacute;sicos.",example_01_04:"Ejemplo simple con fetch, salto y segmento b&aacute;sico de .text/.data.",example_01_03:"Ejemplo simple con fetch, salto y segmento b&aacute;sico de .text.",example_01_02:"Ejemplo simple con fetch, acceso a memoria, y segmento b&aacute;sico de .text/.data.",example_06_01:"Ejemplo de prueba.",example_06_02:"Ejemplo simple con Compiler Explorer.",Advanced:"Avanzado",Initial:"Inicial",Intermediate:"Intermedio",Laboratory:"Laboratorio","Operating Systems":"Sistemas Operativos",Special:"Especial","Load example":"Cargar ejemplo","Load Assembly only":"Cargar Ensamblador solo","Load Firmware only":"Cargar Firmware solo","Copy reference to clipboard":"Copiar referencia al portapapeles",Share:"Compartir","No examples available...":"No examples are available for the selected hardware","Simple example":"Ejemplo simple."};i18n.eltos.dialogs.es={"Show/Hide ActionBar":"Mostrar/Ocultar barra","Show/Hide Slider":"Mostrar/Ocultar sliders","WepSIM User Interface skin":"Variante de Interfaz de Usuario para WepSIM","Initial intro":"Intro inicial","About WepSIM":"Sobre WepSIM",Title:"T&iacute;tulo",Message:"Mensaje",Duration:"Duraci&oacute;n","Confirm remove record...":"¿Seguro que quiere borrar la grabaci&oacute;n actual?","Close or Reset...":"Por favor haga click en Cerrar para mantener la grabaci&oacute;n o en Reiniciar para borrarla.","Sure Control Memory...":"¿Seguro que quiere salvar el contenido actual de la memoria de control en lugar del contenido del editor?.","Show/Hide labels":"Mostrar/Ocultar etiquetas","Show/Hide content":"Mostrar/Ocultar hexadecimal","Show/Hide assembly":"Mostrar/Ocultar ensamblador","Show/Hide pseudo-instructions":"Mostrar/Ocultar pseudo-instrucciones",Close:"Cerrar"};i18n.eltos.gui.en={"Loading WepSIM...":"Loading WepSIM...",Configuration:"Configuration",MicroCode:"MicroCode",Assembly:"Assembly",Simulator:"Simulator",Examples:"Examples",Load:"Load",Save:"Save","Load/Save":"Load/Save",Restore:"Restore",Help:"Help",Notifications:"Notifications",RecordBar:"RecordBar",Input:"Input",Output:"Output","Help Index":"Help Index",Processor:"Processor","Assembly Debugger":"Assembly Debugger",Reset:"Reset",microInstruction:"&#181;Instruction",Instruction:"Instruction",Run:"Run","Hardware Summary":"Hardware Summary",processor:"processor",details:"details",microcode:"microcode",Signals:"Signals",Behaviors:"Behaviors",States:"States","Control States":"Control States",Dependencies:"Dependencies",Close:"Close",Description:"Description",Show:"Show","Show Main Memory":"Show Main Memory",compile:"compile",Compile:"Compile","Please write the file name":"Please write the file name","Load from this File":"Load from this File",labels:"labels",addr:"addr",ess:"ess",content:"content",assembly:"assembly",instructions:"instructions","simulator intro 1":"You can select the hardware to be used. The default one is the EP (Elemental Processor) hardware.<br>"+"You can use <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">the mode selector</span> to change the hardware used.","simulator intro 2":"Then you need to load the microcode (defines the instruction set) and the assembly code.<br>"+"You can use <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'>an example</span>, "+"<span class='text-primary bg-light' onclick='wsweb_select_action(\"checkpoint\");'>load it from a file</span>, "+"or you can edit <span class='text-primary bg-light' onclick='wsweb_change_workspace_microcode();'>a new microcode</span> "+" and <span class='text-primary bg-light' onclick='wsweb_change_workspace_assembly();'>a new assembly code</span>.","simulator intro 3":"Finally, in the simulator you are able to execute the microcode plus assembly loaded before.<br>"+"You can execute it both, at microinstruction level or assembly instruction level.","Prev.":"Prev.",Next:"Next",End:"End","Disable tutorial mode":"Disable tutorial mode",Comment:"Comment",Pause:"Pause",Play:"Play",Stop:"Stop",Record:"Record",Registers:"Registers","Control Memory":"Control Memory",Stats:"Stats",Memory:"Memory","Keyboard+Display":"Keyboard+Display","I/O Stats":"I/O Stats","I/O Configuration":"I/O Configuration",Recent:"Recent",Refresh:"Refresh",Welcome:"Welcome","Microcode & Assembly":"Microcode & Assembly","Pick firm/soft":"Pick firm/soft from",Information:"Information from",Native:"Native","MIPS32-like":"MIPS32-like",RISCV32:"RISCV32","Z80-like":"Z80-like",_last_:"_last_"};i18n.eltos.tutorial_welcome.en={title_0:"Welcome to the WepSIM simulator!",message_0:"<center><img alt='wepsim screenshot' src='images/simulator/simulator012.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"This brief tutorial is going to show you how to:"+"<ol>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,1);'>Load an example.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,2);'>Execute an example.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,3);'>Configure the simulation.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,4);'>Get help.</a></li>"+"</ol>"+"</h5>",title_1:"How to load some example.",message_1:"<center><img alt='wepsim screenshot' src='images/welcome/example_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Click in the 'example' button, then click in the example 'title' name.<br>"+"Then the example for microcode and assembly is loaded and microcompiled and compiled.<br>"+"<br>"+"</h5>",title_2:"How to execute an example.",message_2:"<center><img alt='wepsim screenshot' src='images/welcome/simulation_xinstruction.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Click on next instruction/microinstruction to execute step by step. <br>"+"Click on run button to execute until the first breakpoint or the end of the assembly program."+"<br>"+"</h5>",title_3:"How to configure WepSIM.",message_3:"<center><img alt='wepsim screenshot' src='images/welcome/config_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Click in the 'configuration' button and users are able to customize different parts of WepSIM."+"<br>"+"</h5>",title_4:"How to get the basic help.",message_4:"<center><img alt='wepsim screenshot' src='images/welcome/help_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Please click in the green 'help' button to reach the help dialog.<br>"+"You are able to switch idiom (Spanish/English), go to the help index, or close the help dialog."+"<br>"+"</h5>",title_5:"Welcome to WepSIM!",message_5:"<center><img alt='wepsim screenshot' src='images/welcome/help_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Please explorer the help sections for more information. <br>"+"If you click on the end button of this tutorial, WepSIM is going to load the first example for you. Enjoy!"+"<br>"+"</h5>"};i18n.eltos.tutorial_simpleusage.en={title_0:"Simple WepSIM experience: microprogramming and programming",message_0:"<center><img alt='wepsim screenshot' src='images/simulator/simulator011.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"This brief tutorial is going to show you how to:"+"<ol>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,1);'>Edit your microcode.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'>Edit your assembly (based on the previous microcode).</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,5);'>Execute the assembly+microcode in the simulation.</a></li>"+"</ol>"+"</h5>",title_1:"Simple WepSIM experience: microprogramming and programming",message_1:"<center><img alt='wepsim screenshot' src='images/simulator/firmware001.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"The first step is to microprogramming the firmware to be used. "+"Please use the 'Microcode' button to switch to the microcode screen."+"</h5>",title_2:"Simple WepSIM experience: microprogramming and programming",message_2:"<center><img alt='wepsim screenshot' src='images/simulator/firmware002.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"The microprogramming screen provides:"+"<ul>"+"<li>The editor for the microcode.</li>"+"<li>The microcompiler.</li>"+"<li>The hardware summary and help.</li>"+"</ul>"+"Once your code is ready (compiled without errors), next step is to go to the assembly screen."+"</h5>",title_3:"Simple WepSIM experience: microprogramming and programming",message_3:"<center><img alt='wepsim screenshot' src='images/simulator/assembly002b.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"The second step is to programming the assembly to be executed. "+"Please use the 'Assembly' button from both, the simulator screen or the microcode screen."+"</h5>",title_4:"Simple WepSIM experience: microprogramming and programming",message_4:"<center><img alt='wepsim screenshot' src='images/simulator/assembly003.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"The programming screen provides:"+"<ul>"+"<li>The editor for the assembly code.</li>"+"<li>The assembly compiler.</li>"+"<li>The memory map viewer and help.</li>"+"</ul>"+"Once your assebly code is ready (edited and compiled without errors) next step is to go into the simulation screen."+"</h5>",title_5:"Simple WepSIM experience: microprogramming and programming",message_5:"<center><img alt='wepsim screenshot' src='images/simulator/simulator010.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"The third step is to execute the assembly code in the simulator.<br> "+"The simulator screen provides:"+"<ul>"+"<li>The assembly and hardware view.</li>"+"<li>The detail view of registers, control memory, main memory, etc.</li>"+"<li>The reset, step by step or run until breakpoint/end actions.</li>"+"</ul>"+"This tutorial has introduced the typical usage of WepSIM for students and teachers. Enjoy WepSIM!"+"</h5>"};i18n.eltos.tour_intro.en={step1:"WepSIM helps to better understand how a computer works: "+"it is visual, interactive, integrates from signals up to interruptions, system calls, exceptions, etc. <br> "+"<br>"+"We really believe WepSIM is a revolutionary teaching tool. "+"This brief tour introduces the key elements of its interface.",step2:"This button on the top-right is a quick access menu to differents 'work modes'.<br>"+"<br>"+"Users might select:"+"<ul>"+"<li>The hardware to work with (e.g. EP processor, etc.)</li>"+"<li>Assembly only mode, with integer MIPS<sub>32</sub> or RISC-V<sub>32</sub> instructions</li>"+"<li>The tutorial mode, recommended at the beginning ;-)</li>"+"</ul>",step3:"On the top-right, the 'help' button opens the associated dialog.<br>"+"<br>"+"The help dialog summarizes the tutorials, descriptions, information, etc.",step4:"And on the left, the 'examples' button open the example dialog.<br>"+"<br>"+"There are many examples that can be used to learn incrementally.",step5:"On the top-left, the 'configuration' button opens the configuration dialog.<br>"+"<br>"+"It let users to adapt several aspects of the execution, user interface, preferences, etc.",step6:"Congrat! You know the key elements in the WepSIM interface.<br>"+"From the 'Help' dialog you can access the 'Welcome tutorial' to continue learning.<br>"};i18n.eltos.cfg.en={General:"General","Idiom for help, examples, etc.":"Idiom for help, examples, etc.","Notification speed: time before disapear":"Notification speed: time before disapear",Editor:"Editor","Editor theme: light or dark":"Editor theme: light or dark",Light:"Light",Dark:"Dark","Editor mode: vim, emacs, etc.":"Editor mode: vim, emacs, etc.",Execution:"Execution","Running speed: execution speed":"Running speed: execution speed",Slow:"Slow",Normal:"Normal",Fast:"Fast","Step-by-step: element in run mode":"Step-by-step: element in run mode",Instructions:"Instructions",Instruction:"Instruction","&#181;instructions":"&#181;instructions",microInstruction:"&#181;Instruction","Breakpoint icon: icon to be used for breakpoints":"Breakpoint icon: icon to be used for breakpoints","Limit instructions: number of instructions to be executed":"Limit instructions: number of instructions to be executed","Limit instruction ticks: to limit clock ticks":"Limit instruction ticks: clock ticks limit per instruction","Register file":"Register file","Display format":"Display format","Register file names":"Register file names",Numbers:"Numbers",Labels:"Labels","Editable registers: edit register file values":"Editable registers: edit register file values","Circuitry simulation":"Circuitry simulation","Data-path color":"Data-path color","Signal color":"Signal color","Show by value or by activation":"Show by value or by activation",Value:"Value",Activation:"Activation","Interactive mode: signal value can be updated":"Interactive mode: signal value can be updated","Quick interactive mode: quick update of signal value":"Quick interactive mode: quick update of signal value","(example)":"(example)",Accesibility:"Accesibility","Active voice: external voice control":"Active voice: external voice control","Verbalization: textual or mathematical":"Verbalization: textual or mathematical","WepSIM User Interface views":"WepSIM User Interface views"};i18n.eltos.help.en={"Welcome tutorial":"Welcome tutorial",help_01_01:"Open the welcome tutorial","Simple usage tutorial":"Simple usage tutorial",help_01_02:"Open the simple usage tutorial, for microprogramming and assembly programming","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"Simulator: firmware",help_02_01:"How to work with the firmware to be loaded into the control memory","Microcode format":"Microcode format",help_02_02:"Syntax of the microcode used","Simulator: assembly":"Simulator: assembly",help_02_03:"How to work with the assembly that use the aforementioned firmware","Assembly format":"Assembly format",help_02_04:"Syntax of the assembly elements","Simulator: execution":"Simulator: execution",help_02_05:"How the simulator can execute the assembly and firmware","Simulated architecture":"Simulated architecture",help_03_01:"Description of the simulated processor architecture","Simulated signals":"Simulated signals",help_03_02:"Main signals summary of the simulated elemental processor","Hardware summary":"Hardware summary",help_03_03:"Reference card for the simulated elemental processor hardware","License, platforms, etc.":"License, platforms, etc.",help_04_01:"WepSIM license, supported platforms, technologies used",Authors:"Authors",help_04_02:"Authors of WepSIM"};i18n.eltos.states.en={States:"States",Current:"Current","Current State":"Current State",History:"History",None:"None","Empty history":"Empty history","Empty (only modified values are shown)":"Empty (only modified values are shown)",Differences:"Differences","differences with clipboard state":"differences with clipboard state","Meets the specified requirements":"Meets the specified requirements",history:"history",Add:"Add","'Current State' to History":"'Current State' to History",Check:"Check",Copy:"Copy","to clipboard":"to clipboard",Checkpoint:"Checkpoint","File name":"File name","Tag for checkpoint":"Tag for checkpoint","File to be loaded":"File to be loaded","Save to File":"Save to File","State(s) to checkpoint":"State(s) to checkpoint","Record to checkpoint":"Record to checkpoint","Browser cache":"Browser cache","Session to be restore":"Session to be restore",_last_:"_last_"};i18n.eltos.examples.en={"addv + seqv.":"addv + seqv.","Alloc.s":"Alloc.s","Dummy instruction":"Dummy instruction",Exception:"Exception",Instructions:"Instructions",Interruptions:"Interruptions","Int. + syscall + except.":"Int. + syscall + except.","I/O":"I/O",Looping:"Looping","madd, mmul, mxch":"madd, mmul, mxch","Masks & shift":"Masks & shift",Matrix:"Matrix","Memory access":"Memory access","SC 1, 4-5, 8, 11-12":"SC 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"Subrutine","syscall 1, 4-5, 8, 11-12":"syscall 1, 4-5, 8, 11-12","System call":"System call",Threads:"Threads",Vector:"Vector","Compiler Explorer":"Compiler Explorer",example_04_01:"Advanced example with interruption, system call, and exception.",example_05_01:"Application-specific extension: addv + seqv.",example_05_03:"Application-specific extension: madd + mmul + mxch.",example_05_02:"Application-specific extension: strlen_2 + skipasciicode_2.",example_03_01:"<b>Instructive</b> example with floating point exception.",example_03_02:"<b>Instructive</b> example with interruptions support: fetch, RETI, and .ktext/.kdata.",example_03_03:"<b>Instructive</b> example with system call support.",example_04_04:"Example of malloc + free.",example_04_02:"Example of syscall for printing/reading integer and string.",example_04_03:"Example of threads.",example_03_01b:"Example with floating point exception.",example_03_02b:"Example with interruptions support: fetch, RETI, and .ktext/.kdata.",example_02_01:"Example with programmed I/O access, and basic .text/.data segment.",example_03_03b:"Example with system call support.",example_02_02:"Extended example with more instructions and I/O (keyboard, display).",example_02_04:"Extended example with subrutine and matrix.",example_02_03:"More extended example with masks, shift, and basic .text/.data segment.",example_01_01:"Simple example with fetch, arithmetic instructions, and basic .text segment.",example_01_04:"Simple example with fetch, branch, and basic .text/.data segment.",example_01_03:"Simple example with fetch, branch, and basic .text segment.",example_01_02:"Simple example with fetch, memory access, and basic .text/.data segment.",example_06_01:"Test example.",example_06_02:"Simple Compiler Explorer example.",Advanced:"Advanced",Initial:"Initial",Intermediate:"Intermediate",Laboratory:"Laboratory","Operating Systems":"Operating Systems",Special:"Special","Load example":"Load example","Load Assembly only":"Load Assembly only","Load Firmware only":"Load Firmware only","Copy reference to clipboard":"Copy reference to clipboard",Share:"Share","No examples available...":"No examples are available for the selected hardware","Simple example":"Simple example."};i18n.eltos.dialogs.en={"Show/Hide ActionBar":"Show/Hide ActionBar","Show/Hide Slider":"Show/Hide Slider","WepSIM User Interface skin":"WepSIM User Interface skin","Initial intro":"Initial intro","About WepSIM":"About WepSIM",Title:"Title",Message:"Message",Duration:"Duration","Confirm remove record...":"Do you want to remove the actual record?","Close or Reset...":"Please click on Close to keep it, <br>or click on the Reset button to remove it.","Sure Control Memory...":"Do you want me to save the current Control Memory contents rather than the editor contents?.","Show/Hide labels":"Show/Hide labels","Show/Hide content":"Show/Hide content","Show/Hide assembly":"Show/Hide assembly","Show/Hide pseudo-instructions":"Show/Hide pseudo-instructions",Close:"Close"};i18n.eltos.gui.fr={"Loading WepSIM...":"Chargement de WepSIM ...",Configuration:"Configuration",MicroCode:"MicroCode",Assembly:"Assembly",Simulator:"Simulator",Examples:"Exemples",Load:"Charger",Save:"Enregistrer","Load/Save":"Charger/Enregistrer",Restore:"Restaurer",Help:"Aide",Notifications:"Les notifications",RecordBar:"La barre d'enregistrement",Input:"Entrée",Output:"Sortie","Help Index":"Index de l'aide",Processor:"Processeur","Assembly Debugger":"Débogueur d'assemblage",Reset:"Réinitialiser",microInstruction:"&#181;Instruction",Instruction:"Instruction",Run:"Exécuter","Hardware Summary":"Résumé du matériel.",processor:"processeur",details:"détails",microcode:"microcode",Signals:"Signaux",Behaviors:"Comportements",States:"États","Control States":"États de contrôle",Dependencies:"Dépendances",Close:"Fermer",Description:"Détalle",Show:"Afficher","Show Main Memory":"Afficher la mémoire principale",compile:"compiler",Compile:"Compiler","Please write the file name":"Merci d'écrire le nom du fichier","Load from this File":"Charger à partir de ce fichier",labels:"étiquettes",addr:"adr",ess:"esse",content:"content",assembly:"assembly",instructions:"instructions","simulator intro 1":"Vous pouvez sélectionner le matériel à utiliser. Le matériel par défaut est le matériel EP (Elemental Processor). <br> Vous pouvez utiliser <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">le sélecteur de mode</span> pour changer le matériel utilisé.","simulator intro 2":"Vous devez ensuite charger le microcode (définit le jeu d'instructions) et le code d'assemblage. <br> Vous pouvez utiliser <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'>un exemple</span>, <span class='text-primary bg-light' onclick='wsweb_select_action(\"checkpoint\");'>chargez-le à partir d'un fichier</span>, ou vous pouvez modifier <span class='text-primary bg-light' onclick='wsweb_change_workspace_microcode();'>un nouveau microcode</span> et <span class='text-primary bg-light' onclick='wsweb_change_workspace_assembly();'>un nouveau code d'assemblage</span>.","simulator intro 3":"Enfin, dans le simulateur, vous pouvez exécuter le microcode plus l'assembly chargé auparavant. <br> Vous pouvez l'exécuter simultanément, au niveau de la microinstruction ou au niveau de l'instruction d'assemblage.","Prev.":"Prev.",Next:"Next",End:"End","Disable tutorial mode":"Désactiver le mode tutoriel",Comment:"Commentaire",Pause:"Pause",Play:"Lecture",Stop:"Arrêt",Record:"Enregistrement",Registers:"Registres","Control Memory":"Mémoire de contrôle",Stats:"Statistiques",Memory:"Mémoire","Keyboard+Display":"Clavier+Affichage","I/O Stats":"E/S Statistiques","I/O Configuration":"E/S Configuration",Recent:"Récent",Refresh:"Actualiser",Welcome:"Bienvenue","Microcode & Assembly":"WepSIM hardware","Pick firm/soft":"Choisissez le firmware/logiciel de",Information:"Informations de",Native:"Natif","MIPS32-like":"Code semblable à MIPS32",RISCV32:"RISCV32 Code","Z80-like":"Code semblable à Z80",_last_:"_last_"};i18n.eltos.tutorial_welcome.fr={title_0:"Bienvenue sur le simulateur WepSIM!",message_0:"<center><img alt='wepsim screenshot' src='images/simulator/simulator012.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"Ce bref tutoriel va vous montrer comment:"+"<ol>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,1);'>Charger un exemple.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,2);'>Exécuter un exemple.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,3);'>Configurer la simulation.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,4);'>Obtenir de l'aide.</a></li>"+"</ol>"+"</h5>",title_1:"Comment charger des exemples.",message_1:"<center><img alt='wepsim screenshot' src='images/welcome/example_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Cliquez sur le bouton 'exemple', puis sur le nom de l'exemple 'titre'.<br>"+"Ensuite, l'exemple pour le microcode et l'assemblage est chargé, microcompilé et compilé.<br>"+"<br>"+"</h5>",title_2:"Comment exécuter un exemple.",message_2:"<center><img alt='wepsim screenshot' src='images/welcome/simulation_xinstruction.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Cliquez sur l'instruction suivante/la microinstruction pour exécuter étape par étape. <br>"+"Cliquez sur le bouton Exécuter pour exécuter jusqu'au premier point d'arrêt ou à la fin du programme d'assemblage."+"<br>"+"</h5>",title_3:"Comment configurer WepSIM.",message_3:"<center><img alt='wepsim screenshot' src='images/welcome/config_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Cliquez sur le bouton 'Configuration' pour permettre aux utilisateurs de personnaliser différentes parties de WepSIM."+"<br>"+"</h5>",title_4:"Comment obtenir l'aide de base.",message_4:"<center><img alt='wepsim screenshot' src='images/welcome/help_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Cliquez sur le bouton vert 'aide' pour accéder à la boîte de dialogue d'aide.<br>"+"Vous pouvez changer d'idiome (Espagnol/Anglais), accéder à l'index de l'aide ou fermer la boîte de dialogue d'aide."+"<br>"+"</h5>",title_5:"Bienvenue sur le simulateur WepSIM!",message_5:"<center><img alt='wepsim screenshot' src='images/welcome/help_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"Veuillez explorer les sections d'aide pour plus d'informations. <br>"+"Si vous cliquez sur le bouton de fin de ce tutoriel, WepSIM va charger le premier exemple pour vous. Profitez-en!"+"<br>"+"</h5>"};i18n.eltos.tutorial_simpleusage.fr={title_0:"Expérience WepSIM simple: microprogrammation et programmation",message_0:"<center><img alt='wepsim screenshot' src='images/simulator/simulator011.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"Ce bref tutoriel va vous montrer comment:"+"<ol>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,1);'>Editez votre microcode.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'>Editez votre assemblage (basé sur le microcode précédent).</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,5);'>Exécuter l'assemblage + le microcode dans la simulation.</a></li>"+"</ol>"+"</h5>",title_1:"Expérience WepSIM simple: microprogrammation et programmation",message_1:"<center><img alt='wepsim screenshot' src='images/simulator/firmware001.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"La première étape consiste à microprogrammer le firmware à utiliser. "+"Veuillez utiliser le bouton 'Microcode' pour passer à l'écran du microcode."+"</h5>",title_2:"Expérience WepSIM simple: microprogrammation et programmation",message_2:"<center><img alt='wepsim screenshot' src='images/simulator/firmware002.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"L’écran de microprogrammation fournit:"+"<ul>"+"<li>L'éditeur du microcode.</li>"+"<li>Le microcompilateur.</li>"+"<li>Résumé du matériel et aide.</li>"+"</ul>"+"Une fois que votre code est prêt (compilé sans erreurs), l'étape suivante consiste à accéder à l'écran d'assemblage."+"</h5>",title_3:"Expérience WepSIM simple: microprogrammation et programmation",message_3:"<center><img alt='wepsim screenshot' src='images/simulator/assembly002b.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"La deuxième étape consiste à programmer l'assemblage à exécuter. "+"Veuillez utiliser le bouton 'Assemblage' de l'écran du simulateur ou de l'écran du microcode."+"</h5>",title_4:"Expérience WepSIM simple: microprogrammation et programmation",message_4:"<center><img alt='wepsim screenshot' src='images/simulator/assembly003.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"L'écran de programmation fournit:"+"<ul>"+"<li>L'éditeur du code d'assemblage. </li>"+"<li>Le compilateur d'assemblage. </li>"+"<li>La visionneuse de carte mémoire et l'aide. </li>"+"</ul>"+"Une fois que votre code définitif est prêt (édité et compilé sans erreur), l'étape suivante consiste à accéder à l'écran de simulation."+"</h5>",title_5:"Expérience WepSIM simple: microprogrammation et programmation",message_5:"<center><img alt='wepsim screenshot' src='images/simulator/simulator010.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"La troisième étape consiste à exécuter le code d'assemblage dans le simulateur. <br>"+"L'écran du simulateur fournit:"+"<ul>"+"<li>La vue assemblage et matériel. </li>"+"<li>La vue détaillée des registres, de la mémoire de contrôle, de la mémoire principale, etc. </li>"+"<li>La réinitialisation, étape par étape ou exécution jusqu'au point d'arrêt/actions de fin. </li>"+"</ul>"+"Ce tutoriel a introduit l'utilisation typique de WepSIM pour les étudiants et les enseignants. Profitez de WepSIM!"+"</h5>"};i18n.eltos.tour_intro.fr={step1:"WepSIM aide à mieux comprendre le fonctionnement d'un ordinateur:"+"visuel, interactif, il intègre des signaux jusqu’aux interruptions, appels système, exceptions, etc. <br>"+"<br>"+"Nous pensons vraiment que WepSIM est un outil pédagogique révolutionnaire."+"Cette brève visite présente les éléments clés de son interface.",step2:"Ce bouton en haut à droite est un menu d'accès rapide aux différents modes de travail. <br>"+"<br>"+"Les utilisateurs peuvent sélectionner:"+"<ul>"+"<li> Le matériel avec lequel travailler (processeur EP, etc.)</li>"+"<li> Mode assemblage uniquement, avec entier MIPS<sub>32</sub> ou RISC-V<sub>32</sub> instructions</li>"+"<li> Le mode tutoriel, recommandé au début; -)</li>"+"</ul>",step3:"En haut à droite, le bouton 'aide' ouvre la boîte de dialogue associée. <br>"+"<br>"+"La boîte de dialogue d'aide récapitule les tutoriels, les descriptions, les informations, etc.",step4:"Et à gauche, le bouton 'exemples' ouvre la boîte de dialogue des exemples. <br>"+"<br>"+"Il existe de nombreux exemples qui peuvent être utilisés pour apprendre progressivement.",step5:"En haut à gauche, le bouton 'configuration' ouvre la boîte de dialogue de configuration."+"<br>"+"Il permet aux utilisateurs d'adapter plusieurs aspects de l'exécution, de l'interface utilisateur, des préférences, etc.",step6:"Félicitations! Vous connaissez les éléments clés de l'interface WepSIM. <br>"+"Dans la boîte de dialogue 'Aide', vous pouvez accéder au 'didacticiel de bienvenue' pour continuer à apprendre. <br>"};i18n.eltos.cfg.fr={General:"Général","Idiom for help, examples, etc.":"Idiome pour l'aide, exemples, etc.","Notification speed: time before disapear":"Vitesse de notification: heure avant la disparition",Editor:"L'éditeur","Editor theme: light or dark":"Thème de l'éditeur: clair ou sombre",Light:"Clair",Dark:"Sombre","Editor mode: vim, emacs, etc.":"Mode éditeur: vim, emacs, etc.",Execution:"Exécution","Running speed: execution speed":"Vitesse d'exécution: vitesse d'exécution",Slow:"Lent",Normal:"Normal",Fast:"Rapide","Step-by-step: element in run mode":"Pas à pas: élément en mode d'exécution",Instructions:"Instructions",Instruction:"Instruction","&#181;instructions":"&#181;instructions",microInstruction:"&#181;Instruction","Breakpoint icon: icon to be used for breakpoints":"Icône de point d'arrêt: icône à utiliser pour les points d'arrêt","Limit instructions: number of instructions to be executed":"Instructions limites: nombre d'instructions à exécuter","Limit instruction ticks: to limit clock ticks":"Limites des ticks d'instruction: nombre de ticks d'horloge nstruction","Register file":"Enregistrer un fichier","Display format":"Format d'affichage","Register file names":"Enregistrer un nom de fichier",Numbers:"Numéros",Labels:"Étiquettes","Editable registers: edit register file values":"Registres modifiables: modifier les valeurs du fichier de registre","Circuitry simulation":"Simulation de circuit","Data-path color":"Couleur du chemin de données","Signal color":"Couleur du signal","Show by value or by activation":"Afficher par valeur ou par activation",Value:"Valeur",Activation:"Activation","Interactive mode: signal value can be updated":"Mode interactif: la valeur du signal peut être mise à jour","Quick interactive mode: quick update of signal value":"Mode interactif rapide: mise à jour rapide de la valeur du signal","(example)":"(exemple)",Accesibility:"Accessibilité","Active voice: external voice control":"Voix active: commande vocale externe","Verbalization: textual or mathematical":"Verbalisation: textuelle ou mathématique","WepSIM User Interface views":"Vues de l'interface utilisateur WepSIM"};i18n.eltos.help.fr={"Welcome tutorial":"Tutoriel de bienvenue",help_01_01:"Ouvrez le tutoriel de bienvenue","Simple usage tutorial":"Tutoriel d'utilisation simple",help_01_02:"Ouvrez le tutoriel d'utilisation simple, pour la microprogrammation et l'assemblage. programmation","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"Simulateur: firmware",help_02_01:"Comment utiliser le firmware à charger dans la mémoire de contrôle","Microcode format":"Format du microcode",help_02_02:"Syntaxe du microcode utilisé","Simulator: assembly":"Simulateur: assemblage",help_02_03:"Comment utiliser l'assemblage utilisant le microprogramme susmentionné","Assembly format":"Format d'assemblage",help_02_04:"Syntaxe des éléments d'assemblage","Simulator: execution":"Simulateur: exécution",help_02_05:"Comment le simulateur peut exécuter l'assemblage et le firmware","Simulated architecture":"Architecture simulée",help_03_01:"Description de l'architecture du processeur simulé","Simulated signals":"Signaux simulés",help_03_02:"Résumé des signaux principaux du processeur élémentaire simulé","Hardware summary":"Résumé du matériel",help_03_03:"Carte de référence pour le matériel du processeur élémentaire simulé","License, platforms, etc.":"Licence, plates-formes, etc.",help_04_01:"Licence WepSIM, prise en charge plateformes, technologies utilisées",Authors:"Auteurs",help_04_02:"Auteurs de WepSIM"};i18n.eltos.states.fr={States:"États",Current:"Actuel","Current State":"État actuel",History:"Histoire",None:"Aucune","Empty history":"Historique vide","Empty (only modified values are shown)":"Vide (seules les valeurs modifiées sont affichées)",Differences:"Différences","differences with clipboard state":"Différences avec l'état du presse-papiers","Meets the specified requirements":"Répond aux exigences spécifiées",history:"historique",Add:"Ajouter","'Current State' to History":"'État actuel' à l'historique",Check:"Vérifier",Copy:"Copier","to clipboard":"dans le presse-papiers",Checkpoint:"Point de contrôle","File name":"Nom de fichier","Tag for checkpoint":"Balise pour point de contrôle","File to be loaded":"Fichier à charger","Save to File":"Enregistrer dans un fichier","State(s) to checkpoint":"État (s) au point de contrôle","Record to checkpoint":"Enregistrer au point de contrôle","Browser cache":"Cache du navigateur","Session to be restore":"Session à restaurer",_last_:"_last_"};i18n.eltos.examples.fr={"addv + seqv.":"addv + seqv.","Alloc.s":"Alloc.s","Dummy instruction":"Instruction fictive",Exception:"Exception",Instructions:"Instructions",Interruptions:"Interruptions","Int. + syscall + except.":"Int. + syscall + except.","I/O":"I/O",Looping:"En boucle","madd, mmul, mxch":"madd, mmul, mxch","Masks & shift":"Masques et décalage",Matrix:"Matrice","Memory access":"Accès mémoire","SC 1, 4-5, 8, 11-12":"SC 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"Subrutine","syscall 1, 4-5, 8, 11-12":"Appel système 1, 4-5, 8, 11-12","System call":"Appel système",Threads:"Fils",Vector:"Vecteur","Compiler Explorer":"Compiler Explorer",example_04_01:"Exemple avancé avec interruption, appel système et exception.",example_05_01:"Extension spécifique à l'application: addv + seqv.",example_05_03:"Extension spécifique à l'application: madd + mmul + mxch.",example_05_02:"Extension spécifique à l'application: strlen_2 + skipasciicode_2.",example_03_01:"Exemple <b> Instructive </b> avec exception de virgule flottante.",example_03_02:"Exemple <b> Instructive </b> avec prise en charge des interruptions: fetch, RETI et .ktext/.kdata.",example_03_03:"Exemple <b> Instructive </b> avec prise en charge des appels système.",example_04_04:"Exemple de malloc + free.",example_04_02:"Exemple de appel système pour l'impression/la lecture de nombres entiers et de chaînes.",example_04_03:"Exemple de fils.",example_03_01b:"Exemple avec exception en virgule flottante.",example_03_02b:"Exemple avec prise en charge des interruptions: fetch, RETI et .ktext/.kdata.",example_02_01:"Exemple avec accès I/O programmé et segment de base .text/.data.",example_03_03b:"Exemple avec prise en charge des appels système.",example_02_02:"Exemple étendu avec davantage d'instructions et d'E/S (clavier, affichage).",example_02_04:"Exemple étendu avec sous-programme et matrice.",example_02_03:"Exemple plus détaillé avec masques, décalage et segment de base .text/.data.",example_01_01:"Exemple simple avec récupération, instructions arithmétiques et segment de base .text.",example_01_04:"Exemple simple avec récupération, branche et segment de base .text/.data.",example_01_03:"Exemple simple avec fetch, branche et segment de base .text.",example_01_02:"Exemple simple avec récupération, accès à la mémoire et .text/.data de base segment.",example_06_01:"Exemple de test.",example_06_02:"Exemple de l'explorateur de compilateur simple.",Advanced:"Avancé",Initial:"Initiale",Intermediate:"Intermédiaire",Laboratory:"Laboratoire","Operating Systems":"Systèmes d'exploitation",Special:"Spécial","Load example":"Charger l'exemple","Load Assembly only":"Charger uniquement l'assemblage","Load Firmware only":"Charger uniquement le microprogramme","Copy reference to clipboard":"Copier la référence dans le presse-papiers",Share:"Partager","No examples available...":"Aucun exemple disponible pour le matériel sélectionné","Simple example":"Exemple simple"};i18n.eltos.dialogs.fr={"Show/Hide ActionBar":"Afficher/masquer la barre d'action","Show/Hide Slider":"Afficher/masquer le curseur","WepSIM User Interface skin":"Apparence de l'interface utilisateur WepSIM","Initial intro":"Intro initiale","About WepSIM":"À propos de WepSIM",Title:"Titre",Message:"Message",Duration:"Durée","Confirm remove record...":"Voulez-vous supprimer l'enregistrement en cours?","Close or Reset...":"Cliquez sur Fermer pour le conserver, <br> ou cliquez sur le bouton Réinitialiser pour le supprimer.","Sure Control Memory...":"Voulez-vous que je sauvegarde le contenu actuel de la mémoire de contrôle plutôt que le contenu de l'éditeur?.","Show/Hide labels":"Afficher/masquer les étiquettes","Show/Hide content":"Afficher/masquer le contenu","Show/Hide assembly":"Afficher/masquer l'assemblage","Show/Hide pseudo-instructions":"Afficher/masquer les pseudo-instructions",Close:"Fermer"};i18n.eltos.gui.kr={"Loading WepSIM...":"WepSIM로드 중...",Configuration:"구성",MicroCode:"마이크로 코드",Assembly:"어셈블리",Simulator:"모의 실험 장치",Examples:"예제들",Load:"하중",Save:"구하다","Load/Save":"하중/구하다",Restore:"복원",Help:"도움",Notifications:"알림",RecordBar:"기록 막대",Input:"입력",Output:"산출","Help Index":"도움말 색인",Processor:"프로세서","Assembly Debugger":"어셈블리 디버거",Reset:"다시 놓기",microInstruction:"&#181;교수",Instruction:"교수",Run:"조업","Hardware Summary":"하드웨어 요약",processor:"프로세서",details:"세부",microcode:"마이크로 코드",Signals:"신호",Behaviors:"행동",States:"주","Control States":"제어 상태",Dependencies:"종속성",Close:"닫기",Description:"기술",Show:"보여주기","Show Main Memory":"주 메모리보기",compile:"보여주기",Compile:"보여주기","Please write the file name":"파일 이름을 적어주세요.","Load from this File":"이 파일에서로드",labels:"라벨",addr:"주소",ess:"&nbsp;",content:"함유량",assembly:"어셈블리",instructions:"명령","simulator intro 1":"사용할 하드웨어를 선택할 수 있습니다. 기본 하드웨어는 EP (Elemental Processor) 하드웨어입니다. <br> <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">모드 선택기</span>를 반환하십시오.","simulator intro 2":"그런 다음 마이크로 코드 (명령 세트 정의)와 어셈블리 코드를로드해야합니다. <br> <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'>예</span>, <span class='text-primary bg-light' onclick='wsweb_select_action(\"checkpoint\");'>파일에서로드</span> 또는 <span class='text-primary bg-light' onclick='wsweb_change_workspace_microcode();'>새로운 마이크로 코드</span> 및 <span class='text-primary bg-light' onclick='wsweb_change_workspace_assembly();'>새로운 어셈블리 코드</span>.","simulator intro 3":"마지막으로, 시뮬레이터에서 이전에로드 된 마이크로 코드와 어셈블리를 실행할 수 있습니다. <br> 마이크로 명령 레벨이나 어셈블리 명령 레벨에서 둘 다 실행할 수 있습니다.","Prev.":"너무 이른",Next:"다음 것",End:"끝","Disable tutorial mode":"자습서 모드 사용 안함",Comment:"의견을 남기다",Pause:"일시 정지하다",Play:"연주하다",Stop:"그치다",Record:"기록하다",Registers:"등록부","Control Memory":"제어 메모리",Stats:"통계",Memory:"기억","Keyboard+Display":"키보드 + 표시","I/O Stats":"E/S 통계","I/O Configuration":"E/S 구성",Recent:"충적세",Welcome:"환영합니다",Refresh:"새롭게 하다","Microcode & Assembly":"WepSIM 하드웨어","Pick firm/soft":"에서 펌웨어 / 소프트웨어 선택",Information:"정보 출처",Native:"원주민","MIPS32-like":"MIPS32와 같은 코드",RISCV32:"RISCV32 코드","Z80-like":"Z80와 같은 코드",_last_:"_last_"};i18n.eltos.tutorial_welcome.kr={title_0:"WepSIM 시뮬레이터에 오신 것을 환영합니다",message_0:"<center><img alt='wepsim screenshot' src='images/simulator/simulator012.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"이 간단한 튜토리얼은:"+"<ol>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,1);'>예제로드.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,2);'>예제 실행.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,3);'>시뮬레이션 구성.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,4);'>도움 받기.</a></li>"+"</ol>"+"</h5>",title_1:"몇 가지 예제를로드하는 방법",message_1:"<center><img alt='wepsim screenshot' src='images/welcome/example_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+" '예제'버튼을 클릭하고 예제 'title'이름을 클릭하십시오. <br>"+"그런 다음 마이크로 코드 및 어셈블리 예제가로드되고 마이크로 컴파일되고 컴파일됩니다. <br>"+"<br>"+"</h5>",title_2:"예제를 실행하는 방법.",message_2:"<center><img alt='wepsim screenshot' src='images/welcome/simulation_xinstruction.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"다음 명령어/마이크로 명령어를 클릭하면 단계별로 실행됩니다. <br>"+"첫 번째 중단 점이나 어셈블리 프로그램이 끝날 때까지 실행하려면 실행 버튼을 클릭하십시오."+"<br>"+"</h5>",title_3:"WepSIM을 구성하는 방법",message_3:"<center><img alt='wepsim screenshot' src='images/welcome/config_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+" '구성'버튼을 클릭하면 사용자가 WepSIM의 다른 부분을 사용자 정의 할 수 있습니다."+"<br>"+"</h5>",title_4:"기본 도움말을 얻는 방법",message_4:"<center><img alt='wepsim screenshot' src='images/welcome/help_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"녹색 '도움말'버튼을 클릭하면 도움말 대화 상자가 나타납니다. <br>"+"관용구 (스페인어/영어)를 전환하거나 도움말 색인으로 이동하거나 도움말 대화 상자를 닫을 수 있습니다."+"<br>"+"</h5>",title_5:"WepSIM에 오신 것을 환영합니다",message_5:"<center><img alt='wepsim screenshot' src='images/welcome/help_usage.gif' style='max-width:100%; max-height:60vh'></center>"+"<p>"+"<h5>"+"자세한 내용은 도움말 섹션을 탐색하십시오. <br>"+"이 튜토리얼의 끝 버튼을 클릭하면 WepSIM이 첫 번째 예제를로드합니다. 즐기십시오!"+"<br>"+"</h5>"};i18n.eltos.tutorial_simpleusage.kr={title_0:"간단한 WepSIM 경험 : 마이크로 프로그래밍 및 프로그래밍",message_0:"<center><img alt='wepsim screenshot' src='images/simulator/simulator011.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"이 간단한 튜토리얼은:"+"<ol>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,1);'>마이크로 코드 편집.</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'>어셈블리 편집 (이전 마이크로 코드 기반).</a></li>"+"<li><a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,5);'>시뮬레이션에서 어셈블리 + 마이크로 코드 실행.</a></li>"+"</ol>"+"</h5>",title_1:"간단한 WepSIM 경험 : 마이크로 프로그래밍 및 프로그래밍",message_1:"<center><img alt='wepsim screenshot' src='images/simulator/firmware001.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"첫 번째 단계는 사용할 펌웨어를 마이크로 프로그래밍하는 것입니다. "+"마이크로 코드 화면으로 전환하려면 '마이크로 코드'버튼을 사용하십시오."+"</h5>",title_2:"간단한 WepSIM 경험 : 마이크로 프로그래밍 및 프로그래밍",message_2:"<center><img alt='wepsim screenshot' src='images/simulator/firmware002.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"마이크로 프로그래밍 화면은 다음을 제공합니다."+"<ul>"+"<li> 마이크로 코드 편집기. </li>"+"<li> 마이크로 컴파일러. </li>"+"<li> 하드웨어 요약 및 도움. </li>"+"</ul>"+"일단 코드가 준비되면 (오류없이 컴파일 된) 다음 단계는 어셈블리 화면으로 이동하는 것입니다."+"</h5>",title_3:"간단한 WepSIM 경험 : 마이크로 프로그래밍 및 프로그래밍",message_3:"<center><img alt='wepsim screenshot' src='images/simulator/assembly002b.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"두 번째 단계는 실행될 어셈블리를 프로그래밍하는 것입니다. "+"시뮬레이터 화면이나 마이크로 코드 화면에서 '어셈블리'버튼을 사용하십시오."+"</h5>",title_4:"간단한 WepSIM 경험 : 마이크로 프로그래밍 및 프로그래밍",message_4:"<center><img alt='wepsim screenshot' src='images/simulator/assembly003.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"프로그래밍 화면에서는 다음을 제공합니다."+"<ul>"+"<li> 어셈블리 코드 편집기. </li>"+"<li> 어셈블리 컴파일러. </li>"+"<li> 메모리 맵 뷰어 및 도움말. </li>"+"</ul>"+"일단 당신의 assebly 코드가 준비되면 (오류없이 편집되고 컴파일 된) 다음 단계는 시뮬레이션 화면으로 들어가는 것입니다."+"</h5>",title_5:"간단한 WepSIM 경험 : 마이크로 프로그래밍 및 프로그래밍",message_5:"<center><img alt='wepsim screenshot' src='images/simulator/simulator010.jpg' style='max-width:100%; max-height:40vh;'></center>"+"<p>"+"<h5>"+"세 번째 단계는 시뮬레이터에서 어셈블리 코드를 실행하는 것입니다. <br>"+"시뮬레이터 화면은 다음을 제공합니다 :"+"<ul>"+"<li> 어셈블리 및 하드웨어보기 </li>"+"<li> 레지스터, 제어 메모리, 메인 메모리 등의 상세보기 </li>"+"<li> 단계별로 재설정하거나 중단 점/종료 작업까지 실행하십시오. </li>"+"</ul>"+"이 튜토리얼은 학생 및 교사를위한 WepSIM의 일반적인 사용법을 소개했습니다. WepSIM을 즐기십시오!"+"</h5>"};i18n.eltos.tour_intro.kr={step1:"WepSIM을 사용하면 컴퓨터 작동 방식을 더 잘 이해할 수 있습니다."+"시각적이며 대화 형이며 신호에서 중단, 시스템 호출, 예외 등을 통합합니다."+"<br>"+"우리는 WepSIM이 혁신적인 교육 도구라고 믿습니다."+"이 간단한 둘러보기는 인터페이스의 핵심 요소를 소개합니다.",step2:"오른쪽 상단의이 버튼은 다른 '작업 모드'에 대한 빠른 액세스 메뉴입니다. <br>"+"<br>"+"사용자는 다음을 선택할 수 있습니다."+"<ul>"+"<li> 사용할 하드웨어 (예 : EP 프로세서 등) </li>"+"<li> 정수 MIPS<sub>32</sub> 또는 RISC-V<sub>32</sub> 명령어가있는 어셈블리 전용 모드"+"<li> 처음에 권장되는 튜토리얼 모드;-) </li>"+"</ul>",step3:"오른쪽 상단의 '도움말'버튼을 누르면 관련 대화 상자가 열립니다. <br>"+"<br>"+"도움말 대화 상자는 자습서, 설명, 정보 등을 요약합니다.",step4:"왼쪽에는 'examples' 버튼이 예제 대화 상자를 엽니 다. <br>"+"<br>"+"점진적으로 배우는 데 사용할 수있는 많은 예가 있습니다.",step5:"왼쪽 상단에 'configuration' 버튼이 구성 대화 상자를 엽니 다. <br> +"+"<br>"+"사용자가 실행, 사용자 인터페이스, 환경 설정 등의 여러 측면을 적용 할 수있게 해줍니다.",step6:"축하합니다! WepSIM 인터페이스의 핵심 요소를 알고 계십니다. <br>"+" '도움말'대화 상자에서 '환영 자습서'에 액세스하여 학습을 계속할 수 있습니다. <br>"};i18n.eltos.cfg.kr={General:"일반","Idiom for help, examples, etc.":"도움, 예제 등을위한 관용구","Notification speed: time before disapear":"알림 속도 : 사라지기 전의 시간",Editor:"편집자","Editor theme: light or dark":"편집기 테마 : 밝거나 어두움",Light:"빛",Dark:"어두운","Editor mode: vim, emacs, etc.":"편집기 모드 : vim, emacs 등",Execution:"실행","Running speed: execution speed":"실행 속도 : 실행 속도",Slow:"느린",Normal:"표준",Fast:"빠른","Step-by-step: element in run mode":"단계별 : 실행 모드의 요소",Instructions:"교수",Instruction:"교수","&#181;instructions":"&#181;교수",microInstruction:"&#181;교수","Breakpoint icon: icon to be used for breakpoints":"중단 점 아이콘 : 중단 점에 사용될 아이콘","Limit instructions: number of instructions to be executed":"제한 명령어 : 실행될 명령어의 수","Limit instruction ticks: to limit clock ticks":"명령어 틱 제한 : 명령어 당 클록 틱 제한","Register file":"등록 파일","Display format":"표시 형식","Register file names":"파일 이름 등록",Numbers:"번호",Labels:"레이블","Editable registers: edit register file values":"편집 가능한 레지스터 : 레지스터 파일 값 편집","Circuitry simulation":"회로 시뮬레이션","Data-path color":"데이터 경로 색상","Signal color":"신호 색상","Show by value or by activation":"가치 또는 활성화로 보여라",Value:"가치",Activation:"활성화","Interactive mode: signal value can be updated":"대화 형 모드 : 신호 값을 업데이트 할 수 있습니다","Quick interactive mode: quick update of signal value":"빠른 대화 형 모드 : 신호 값의 빠른 업데이트","(example)":"(예)",Accesibility:"접근성","Active voice: external voice control":"활성 음성 : 외부 음성 제어","Verbalization: textual or mathematical":"언어학 : 텍스트 또는 수학","WepSIM User Interface views":"WepSIM 사용자 인터페이스보기"};i18n.eltos.help.kr={"Welcome tutorial":"환영 자습서",help_01_01:"환영하는 자습서 열기","Simple usage tutorial":"간단한 사용법 자습서",help_01_02:"마이크로 프로그래밍 및 어셈블리 프로그래밍을위한 간단한 사용법 자습서 열기","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"시뮬레이터 : 펌웨어",help_02_01:"펌웨어를 제어 메모리에로드하는 방법","Microcode format":"마이크로 코드 형식",help_02_02:"사용 된 마이크로 코드의 구문","Simulator: assembly":"시뮬레이터 : 어셈블리",help_02_03:"앞서 언급 한 펌웨어를 사용하는 어셈블리 작업 방법","Assembly format":"어셈블리 형식",help_02_04:"어셈블리 요소의 구문","Simulator: execution":"시뮬레이터 : 실행",help_02_05:"시뮬레이터가 어셈블리 및 펌웨어를 실행할 수있는 방법","Simulated architecture":"시뮬레이션 된 아키텍처",help_03_01:"시뮬레이트 된 프로세서 아키텍처에 대한 설명","Simulated signals":"시뮬레이션 된 신호",help_03_02:"시뮬레이션 된 기본 프로세서의 주요 신호 요약","Hardware summary":"하드웨어 요약",help_03_03:"시뮬레이트 된 기본 프로세서 하드웨어에 대한 참조 카드","License, platforms, etc.":"라이센스, 플랫폼 등",help_04_01:"WEPSIM 라이센스, 지원 플랫폼, 사용 된 기술",Authors:"저자",help_04_02:"WepSIM의 저자"};i18n.eltos.states.kr={States:"주",Current:"현재","Current State":"현재 상태",History:"역사",None:"없음","Empty history":"비어있는 기록","Empty (only modified values are shown)":"비어 있음 (수정 된 값만 표시됨)",Differences:"차이점","differences with clipboard state":"클립 보드 상태와의 차이점","Meets the specified requirements":"지정된 요구 사항 충족",history:"역사",Add:"추가","'Current State' to History":"역사에 ''현재 국가 ",Check:"확인",Copy:"복사","to clipboard":"클립 보드에",Checkpoint:"검사 점","File name":"파일 이름","Tag for checkpoint":"검사 점을위한 태그","File to be loaded":"로드 할 파일","Save to File":"파일에 저장","State(s) to checkpoint":"검사 점의 상태","Record to checkpoint":"체크 포인트에 기록","Browser cache":"브라우저 캐시","Session to be restore":"복원 할 세션",_last_:"_last_"};i18n.eltos.examples.kr={"addv + seqv.":"addv + seqv.","Alloc.s":"Alloc.s","Dummy instruction":"Dummy instruction",Exception:"Exception",Instructions:"Instructions",Interruptions:"Interruptions","Int. + syscall + except.":"Int. + syscall + except.","I/O":"I/O",Looping:"Looping","madd, mmul, mxch":"madd, mmul, mxch","Masks & shift":"Masks & shift",Matrix:"Matrix","Memory access":"Memory access","SC 1, 4-5, 8, 11-12":"SC 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"Subrutine","syscall 1, 4-5, 8, 11-12":"syscall 1, 4-5, 8, 11-12","System call":"System call",Threads:"Threads",Vector:"Vector","Compiler Explorer":"Compiler Explorer",example_04_01:"중단, 시스템 호출 및 예외가있는 고급 예제",example_05_01:"응용 프로그램 관련 확장 프로그램 : addv + seqv.",example_05_03:"응용 프로그램 관련 확장 프로그램 : madd + mmul + mxch.",example_05_02:"응용 프로그램 관련 확장 프로그램 : strlen_2 + skipasciicode_2.",example_03_01:"부동 소수점 예외가있는 실용적인 예제",example_03_02:"인터럽트를 지원하는 지침적인 예 : fetch, RETI 및 .ktext/.kdata.",example_03_03:"시스템 호출을 지원하는 지침적인 예",example_04_04:"malloc + free 예제",example_04_02:"정수 및 문자열 인쇄/읽기 용 syscall 예제",example_04_03:"스레드의 예",example_03_01b:"부동 소수점 예외가있는 예",example_03_02b:"중단이있는 예 : fetch, RETI 및 .ktext/.kdata.",example_02_01:"프로그래밍 된 I/O 액세스 및 기본. 텍스트 /. 데이터 세그먼트가있는 예",example_03_03b:"시스템 호출 지원 예제",example_02_02:"더 많은 지침과 I/O (키보드, 디스플레이)가있는 확장 예제.",example_02_04:"서브 루틴 및 행렬이있는 확장 된 예제",example_02_03:"마스크, 시프트 및 기본. 텍스트 /. 데이터 세그먼트가있는 확장 된 예제입니다.",example_01_01:"가져 오기, 산술 명령어 및 기본. 텍스트 세그먼트가있는 간단한 예제입니다.",example_01_04:"가져 오기, 분기 및 기본. 텍스트 /. 데이터 세그먼트가있는 간단한 예제입니다.",example_01_03:"가져 오기, 분기 및 기본 .text 세그먼트가있는 간단한 예제입니다.",example_01_02:"가져 오기, 메모리 액세스 및 기본. 텍스트 /. 데이터 세그먼트가있는 간단한 예제입니다.",example_06_01:"테스트 예.",example_06_02:"간단한 컴파일러 탐색기 예제.",Advanced:"많은",Initial:"머리 글자",Intermediate:"중급",Laboratory:"실험실","Operating Systems":"운영체제",Special:"특별한","Load example":"로드 예제","Load Assembly only":"로드 어셈블리 전용","Load Firmware only":"펌웨어로드 전용","Copy reference to clipboard":"클립 보드에 참조 복사",Share:"몫","No examples available...":"선택한 하드웨어에 대한 예제가 없습니다","Simple example":"간단한 예"};i18n.eltos.dialogs.kr={"Show/Hide ActionBar":"ActionBar 표시 / 숨기기","Show/Hide Slider":"슬라이더 표시 / 숨기기","WepSIM User Interface skin":"WepSIM 사용자 인터페이스 스킨","Initial intro":"초기 소개","About WepSIM":"WepSIM 소개",Title:"제목",Message:"메시지",Duration:"재생 시간","Confirm remove record...":"현재 레코드를 제거 하시겠습니까?","Close or Reset...":"계속하려면 닫기를 클릭하고, <br> 단추를 클릭하여 제거하십시오.","Sure Control Memory...":"편집기 내용이 아닌 현재 컨트롤 메모리 내용을 저장 하시겠습니까?","Show/Hide labels":"레이블 표시 / 숨기기","Show/Hide content":"콘텐츠 표시 / 숨기기","Show/Hide assembly":"어셈블리 표시 / 숨기기","Show/Hide pseudo-instructions":"의사 명령어 표시 / 숨기기",Close:"닫다"};i18n.eltos.gui.ja={"Loading WepSIM...":"WepSIMを読み込んでいます...",Configuration:"設定",MicroCode:"マイクロコード",Assembly:"アセンブリ",Simulator:"シミュレータ",Examples:"例",Load:"負荷",Save:"保存する","Load/Save":"負荷/保存する",Restore:"リストア",Help:"助けて",Notifications:"通知",RecordBar:"レコードバー",Input:"入力",Output:"出力","Help Index":"ヘルプインデックス",Processor:"プロセッサ","Assembly Debugger":"アセンブリデバッガ",Reset:"リセット",microInstruction:"μインストラクション",Instruction:"命令",Run:"実行する","Hardware Summary":"ハードウェア概要",processor:"プロセッサ",details:"詳細",microcode:"マイクロコード",Signals:"シグナル",Behaviors:"ふるまい",States:"州","Control States":"制御状態",Dependencies:"依存関係",Close:"閉じる",Description:"説明",Show:"見せる","Show Main Memory":"メインメモリを表示",compile:"コンパイル",Compile:"コンパイル","Please write the file name":"ファイル名を書いてください","Load from this File":"このファイルから読み込む",labels:"ラベル",addr:"addr",ess:"エス",content:"コンテンツ",assembly:"アセンブリ",instructions:"説明書","simulator intro 1":"使用するハードウェアを選択できます。デフォルトのハードウェアはEP（Elemental Processor）ハードウェアです。<br> <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">モードセレクタ</span>を使用して、使用するハードウェアを変更します。","simulator intro 2":"次に、マイクロコード（命令セットを定義）とアセンブリコードをロードする必要があります。<br> <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'>例</span>、<span class='text-primary bg-light' onclick = 'wsweb_select_action(\"checkpoint\");'>ファイルから読み込む</span>、または<span class='text-primary bg-light 'onclick='wsweb_change_workspace_microcode();'>新しいマイクロコード</span>および<span class='text-primary bg-light 'onclick='wsweb_change_workspace_assembly();'>新しいアセンブリコード</span>。","simulator intro 3":"最後に、シミュレーターでは、以前にロードされたマイクロコードとアセンブリを実行できます。<br>マイクロ命令レベルまたはアセンブリ命令レベルで両方を実行できます。","Prev.":"前",Next:"次",End:"終わり","Disable tutorial mode":"チュートリアルモードを無効にする",Comment:"コメント",Pause:"一時停止",Play:"遊びます",Stop:"やめる",Record:"記録",Registers:"「登録簿」","Control Memory":"「コントロールメモリ」",Stats:"統計",Memory:"「記憶」","Keyboard+Display":"キーボード+ディスプレイ","I/O Stats":"I/O 統計","I/O Configuration":"I/O 設定",Recent:"最近",Refresh:"更新する",Welcome:"ようこそ","Microcode & Assembly":"WepSIMハードウェア","Pick firm/soft":"からファームウェア/ソフトウェアを選択",Information:"からの情報",Native:"ネイティブ","MIPS32-like":"MIPS32のようなコード",RISCV32:"RISCV32コード","Z80-like":"Z80のようなコード",_last_:"_last_"};i18n.eltos.tutorial_welcome.ja={title_0:"WepSIMシミュレータへようこそ！",message_0:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/simulator012.jpg' style = 'max-width: 100％; max-height: 40vh; '> </center> <p> <h5>この簡単なチュートリアルでは、以下の方法について説明します。<ol> <li> <a href ='＃ 'onclick =' sim_tutorial_goframe（ \"welcome\" 、0,1）; '>例を読み込みます。</a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,2);'>例を実行してください。 </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,3);'>シミュレーションを設定します。</a> </li> <li> <a href = '＃' onclick = 'sim_tutorial_goframe（ \"welcome\"、0,4）;'>サポートを受けてください。</a> </li></ol> </h5>",title_1:"例を読み込む方法",message_1:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/example_usage.gif' style = 'max-width: 100％; max-height: 60vh '> </center> <p> <h5>「example」ボタンをクリックし、次に「title」名の例をクリックします。<br>次に、マイクロコードとアセンブリの例を読み込んでマイクロコンパイルし、コンパイル済み。<br> <br> </h5>",title_2:"例を実行する方法",message_2:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/simulation_xinstruction.gif' style = 'max-width: 100％; max-height: 60vh '> </center> <p> <h5>次の命令/マイクロ命令をクリックすると、段階的に実行されます。 <br>実行ボタンをクリックして、最初のブレークポイントまたはアセンブリプログラムの最後まで実行します。<br> </h5>",title_3:"WepSIMの設定方法",message_3:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/config_usage.gif' style = 'max-width: 100％; max-height: 60vh '> </center> <p> <h5>「設定」ボタンをクリックすると、ユーザーはWepSIMのさまざまな部分をカスタマイズできます。<br> </h5>",title_4:"基本的な助けを得る方法。",message_4:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/help_usage.gif' style = 'max-width: 100％; max-height: 60vh '> </center> <p> <h5>緑色の「ヘルプ」ボタンをクリックしてヘルプダイアログにアクセスしてください。<br>イディオム（スペイン語/英語）を切り替えることができます。ヘルプインデックスを作成するか、ヘルプダイアログを閉じます。<br> </h5>",title_5:"WepSIMへようこそ！",message_5:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/help_usage.gif' style = 'max-width: 100％; max-height: 60vh '> </center> <p> <h5>詳細についてはヘルプセクションをご覧ください。 <br>このチュートリアルの終了ボタンをクリックすると、WepSIMが最初の例をロードします。お楽しみください。<br> </h5>",_last_:"_last_"};i18n.eltos.tutorial_simpleusage.ja={title_0:"簡単なWepSIMの経験：マイクロプログラミングとプログラミング",message_0:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/simulator011.jpg' style = 'max-width: 100％; max-height: 40vh; '> </center> <p> <h5>この簡単なチュートリアルでは、以下の方法について説明します。<ol> <li> <a href ='＃ 'onclick =' sim_tutorial_goframe（ \"simpleusage\" 、> 0,1）; '>マイクロコードを編集します。</a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'>アセンブリを編集します（） </a> </li> <li> <a href='#'onclick='sim_tutorial_goframe(\"simpleusage\",0,5);'>シミュレーションでアセンブリ+マイクロコードを実行します。 </a> </li></ol> </h5>",title_1:"簡単なWepSIMの経験：マイクロプログラミングとプログラミング",message_1:"<center> <img alt = 'wepsim screenshot' src = 'ヘルプ/シミュレータ/ firmware001.jpg' style = 'max-width: 100％; max-height: 40vh; '> </center> <p> <h5>最初のステップは、使用するファームウェアをマイクロプログラミングすることです。マイクロコード画面に切り替えるには、[マイクロコード]ボタンを使用してください。</h5>",title_2:"簡単なWepSIMの経験：マイクロプログラミングとプログラミング",message_2:"<center> <img alt = 'wepsim screenshot' src = 'ヘルプ/シミュレータ/ firmware002.jpg' style = 'max-width: 100％; max-height: 40vh; '> </center> <p> <h5>マイクロプログラミング画面には、次のものがあります。 li>ハードウェアの概要とヘルプ</li> </ul>コードの準備ができたら（エラーなしでコンパイルされたら）、次のステップはアセンブリ画面に進むことです。</h5>",title_3:"簡単なWepSIMの経験：マイクロプログラミングとプログラミング",message_3:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/assembly002b.jpg' style = 'max-width: 100％; max-height: 40vh; '> </center> <p> <h5>次に、アセンブリを実行するようにプログラミングします。シミュレータ画面またはマイクロコード画面の両方から[アセンブリ]ボタンを使用してください。</h5>",title_4:"簡単なWepSIMの経験：マイクロプログラミングとプログラミング",message_4:"<center> <img alt = 'スクリーンショット' src = 'images/simulator/assembly003.jpg' style = 'max-width: 100％; max-height: 40vh; '> </center> <p> <h5>プログラミング画面には、次のものがあります。<ul> <li>アセンブリコードのエディタ</li> <li>アセンブリコンパイラ</li > <li>メモリマップビューアとヘルプ</li> </ul>アセンブリコードの準備が整ったら（エラーなしで編集およびコンパイル）、次のステップはシミュレーション画面に進むことです。</h5>",title_5:"簡単なWepSIMの経験：マイクロプログラミングとプログラミング",message_5:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/simulator010.jpg' style = 'max-width: 100％; max-height: 40vh; '> </center> <p> <h5> 3番目のステップは、シミュレータでアセンブリコードを実行することです。<br>シミュレータ画面には、次のように表示されます。<ul> <li>アセンブリビューとハードウェアビュー</li> <li>レジスタ、制御メモリ、メインメモリなどの詳細ビュー</li> <li>リセット、ステップバイステップ、またはブレークポイント/終了アクションまで実行。</li> </ul >このチュートリアルでは、学生と教師のためのWepSIMの典型的な使い方を紹介しました。 WepSIMをお楽しみください。</h5>",_last_:"_last_"};i18n.eltos.tour_intro.ja={step1:"WepSIMは、コ​​ンピュータの動作をよりよく理解するのに役立ちます。視覚的、対話的、信号から割り込み、システムコール、例外などに統合されます。<br> <br> WepSIMは革命的な教育ツールであると私たちは信じています。この短いツアーでは、そのインターフェースの重要な要素を紹介します。",step2:"右上のこのボタンは、さまざまな「作業モード」へのクイックアクセスメニューです。<br> <br>ユーザーは次を選択できます。<ul> <li>使用するハードウェア（EPプロセッサなど）</li> <li>整数MIPS<sub>32</sub>またはRISC-V<sub>32</sub>命令を使用したアセンブリ専用モード</li> <li>最初に推奨されるチュートリアルモード;- ）</li></ul>",step3:"右上の[ヘルプ]ボタンをクリックすると、関連するダイアログが開きます。<br> <br>ヘルプダイアログには、チュートリアル、説明、情報などがまとめられています。",step4:"そして左側にある 'examples'ボタンをクリックするとダイアログの例が開きます。",step5:"左上の[設定]ボタンをクリックすると、設定ダイアログが開きます。<br> <br>実行、ユーザーインターフェイス、設定などのさまざまな側面をユーザーが調整できます。",step6:"おめでとうございます。 WepSIMインターフェースの重要な要素を知っています。<br> [ヘルプ]ダイアログから[ようこそチュートリアル]にアクセスして、学習を続けることができます。<br>",_last_:"_last_"};i18n.eltos.cfg.ja={General:"全般","Idiom for help, examples, etc.":"助けのための慣用句、例など","Notification speed: time before disapear":"通知速度：消えるまでの時間",Editor:"編集者","Editor theme: light or dark":"編集テーマ：明暗",Light:"光",Dark:"ダーク","Editor mode: vim, emacs, etc.":"エディタモード：vim、emacsなど",Execution:"実行","Running speed: execution speed":"走行速度：実行速度",Slow:"スロー",Normal:"普通",Fast:"速い","Step-by-step: element in run mode":"ステップバイステップ：実行モードの要素",Instructions:"説明書",Instruction:"命令","&#181;instructions":"マイクロインストラクション",microInstruction:"μインストラクション","Breakpoint icon: icon to be used for breakpoints":"ブレークポイントアイコン：ブレークポイントに使用されるアイコン","Limit instructions: number of instructions to be executed":"制限命令：実行する命令数","Limit instruction ticks: to limit clock ticks":"命令ティックを制限する：命令ごとのクロックティック数の制限","Register file":"ファイル登録","Display format":"表示フォーマット","Register file names":"ファイル名を登録する",Numbers:"番号",Labels:"ラベル","Editable registers: edit register file values":"編集可能レジスタ：レジスタファイル値の編集","Circuitry simulation":"回路シミュレーション","Data-path color":"データパスカラー","Signal color":"シグナルカラー","Show by value or by activation":"値別またはアクティブ化別に表示",Value:"値",Activation:"アクティベーション","Interactive mode: signal value can be updated":"インタラクティブモード：信号値を更新することができます","Quick interactive mode: quick update of signal value":"クイックインタラクティブモード：シグナル値のクイックアップデート","(example)":"（例）",Accesibility:"アクセシビリティ","Active voice: external voice control":"アクティブボイス：外部ボイスコントロール","Verbalization: textual or mathematical":"言語化：テキストまたは数学","WepSIM User Interface views":"WepSIMユーザーインターフェースビュー",_last_:"_last_"};i18n.eltos.help.ja={"Welcome tutorial":"ようこそチュートリアル",help_01_01:"ウェルカムチュートリアルを開く","Simple usage tutorial":"簡単な使い方のチュートリアル",help_01_02:"マイクロプログラミングとアセンブリプログラミングのための簡単な使い方のチュートリアルを開く","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"シミュレータ：ファームウェア",help_02_01:"制御メモリにロードされるファームウェアを使用する方法","Microcode format":"マイクロコードフォーマット",help_02_02:"使用されているマイクロコードの構文","Simulator: assembly":"シミュレータ：組み立て",help_02_03:"上記のファームウェアを使用するアセンブリの使用方法","Assembly format":"組立フォーマット",help_02_04:"アセンブリ要素の構文","Simulator: execution":"シミュレータ：実行",help_02_05:"シミュレータがアセンブリとファームウェアを実行する方法","Simulated architecture":"シミュレーションアーキテクチャ",help_03_01:"シミュレートされたプロセッサアーキテクチャの説明","Simulated signals":"シミュレーション信号",help_03_02:"模擬要素プロセッサの主な信号の概要","Hardware summary":"ハードウェア概要",help_03_03:"シミュレートされた基本プロセッサーハードウェアの参照カード","License, platforms, etc.":"ライセンス、プラットフォームなど",help_04_01:"WepSIMライセンス、サポートされているプラ​​ットフォーム、使用されているテクノロジ",Authors:"作者",help_04_02:"WepSIMの作者",_last_:"_last_"};i18n.eltos.states.ja={States:"州",Current:"現在","Current State":"現在の状態",History:"歴史",None:"無し","Empty history":"空の歴史","Empty (only modified values are shown)":"空（変更された値のみ表示）",Differences:"違い","differences with clipboard state":"クリップボードの状態との違い","Meets the specified requirements":"指定された要件を満たします",history:"歴史",Add:"追加する","'Current State' to History":"歴史に対する「現状」",Check:"チェック",Copy:"コピーする","to clipboard":"クリップボードへ",Checkpoint:"チェックポイント","File name":"ファイル名","Tag for checkpoint":"チェックポイントのタグ","File to be loaded":"ロードするファイル","Save to File":"ファイルに保存","State(s) to checkpoint":"チェックポイントまでの状態","Record to checkpoint":"チェックポイントへの記録","Browser cache":"ブラウザキャッシュ","Session to be restore":"復元するセッション",_last_:"_last_"};i18n.eltos.examples.ja={"addv + seqv.":"addv + seqv","Alloc.s":"同種","Dummy instruction":"ダミー指導",Exception:"例外",Instructions:"説明書",Interruptions:"中断","Int. + syscall + except.":"Int。 + syscall +以外。","I/O":"I/O",Looping:"ループ","madd, mmul, mxch":"助け、気分、こころ","Masks & shift":"マスク＆シフト",Matrix:"マトリックス","Memory access":"メモリアクセス","SC 1, 4-5, 8, 11-12":"SC 1、4〜5、8、11〜12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"サブルーチン","syscall 1, 4-5, 8, 11-12":"システムコール1、4〜5、8、11〜12","System call":"システムコール",Threads:"スレッド",Vector:"ベクター","Compiler Explorer":"Compiler Explorer",example_04_01:"割り込み、システムコール、および例外を含む高度な例",example_05_01:"アプリケーション固有の拡張子：addv + seqv。",example_05_03:"アプリケーション固有の拡張子：madd + mmul + mxch。",example_05_02:"アプリケーション固有の拡張子：strlen_2 + skipasciicode_2。",example_03_01:"浮動小数点例外を使用した<b>有益な</b>例。",example_03_02:"割り込みをサポートする<b>有益な</b>例：fetch、RETI、.ktext/.kdata。",example_03_03:"システムコールをサポートする<b>有益な</b>例。",example_04_04:"malloc + freeの例",example_04_02:"整数と文字列を印刷/読み取りするためのsyscallの例。",example_04_03:"スレッドの例",example_03_01b:"浮動小数点例外を使用した例",example_03_02b:"割り込みをサポートする例：fetch、RETI、および.ktext/.kdata。",example_02_01:"プログラムされたI/Oアクセスと基本的な.text/.dataセグメントの例",example_03_03b:"システムコールサポートの例",example_02_02:"より多くの命令とI/O（キーボード、ディスプレイ）を含む拡張例。",example_02_04:"サブルーチンとマトリックスの拡張例",example_02_03:"マスク、シフト、および基本的な.text/.dataセグメントを含む、より拡張された例。",example_01_01:"フェッチ、算術命令、および基本的な.textセグメントを使用した簡単な例。",example_01_04:"フェッチ、ブランチ、そして基本的な.text/.dataセグメントを使った簡単な例。",example_01_03:"フェッチ、ブランチ、そして基本的な.textセグメントを使った簡単な例。",example_01_02:"フェッチ、メモリアクセス、および基本的な.text/.dataセグメントを使用した簡単な例。",example_06_01:"テスト例",example_06_02:"単純なコンパイラエクスプローラの例.",Advanced:"高度な",Initial:"初期",Intermediate:"中級",Laboratory:"実験室","Operating Systems":"オペレーティングシステム",Special:"特殊","Load example":"ロード例","Load Assembly only":"荷重アセンブリのみ","Load Firmware only":"ファームウェアのみをロード","Copy reference to clipboard":"クリップボードへの参照のコピー",Share:"共有（アンドロイド）","No examples available...":"選択したハードウェアの例はありません","Simple example":"簡単な例",_last_:"_last_"};i18n.eltos.dialogs.ja={"Show/Hide ActionBar":"アクションバーの表示/非表示","Show/Hide Slider":"スライダーの表示/非表示","WepSIM User Interface skin":"WepSIMユーザーインターフェーススキン","Initial intro":"初期イントロ","About WepSIM":"WepSIMについて",Title:"タイトル",Message:"メッセージ",Duration:"期間","Confirm remove record...":"実際のレコードを削除しますか？","Close or Reset...":"閉じるには[閉じる]をクリックしてください。削除するには[リセット]ボタンをクリックしてください。","Sure Control Memory...":"エディタの内容ではなく現在のコントロールメモリの内容を保存してもよろしいですか。","Show/Hide labels":"ラベルの表示/非表示","Show/Hide content":"コンテンツの表示/非表示","Show/Hide assembly":"アセンブリを表示/隠す","Show/Hide pseudo-instructions":"擬似命令の表示/非表示",Close:"閉じる",_last_:"_last_"};i18n.eltos.gui.it={"Loading WepSIM...":"Caricamento WepSIM ...",Configuration:"Configurazione",MicroCode:"MicroCode",Assembly:"montaggio",Simulator:"Simulatore",Examples:"Esempi",Load:"Caricare",Save:"Salvare","Load/Save":"Caricare/Salvare",Restore:"Ristabilire",Help:"Aiuto",Notifications:"Notifiche",RecordBar:"RecordBar",Input:"Ingresso",Output:"Produzione","Help Index":"Indice della Guida",Processor:"Processore","Assembly Debugger":"Assembly Debugger",Reset:"Reset",microInstruction:"μIstruzione",Instruction:"istruzione",Run:"Correre","Hardware Summary":"Riepilogo Hardware",processor:"processore",details:"dettagli",microcode:"microcodice",Signals:"segnali",Behaviors:"comportamenti",States:"stati","Control States":"Stati di controllo",Dependencies:"dipendenze",Close:"Vicino",Description:"Descrizione",Show:"Mostrare","Show Main Memory":"Mostra la memoria principale",compile:"compilare",Compile:"Compilare","Please write the file name":"Si prega di scrivere il nome del file","Load from this File":"Carica da questo file",labels:"etichette",addr:"addr",ess:"ess",content:"soddisfare",assembly:"montaggio",instructions:"Istruzioni","simulator intro 1":"È possibile selezionare l'hardware da utilizzare. Quello predefinito è l'hardware EP (Elemental Processor). <br> È possibile utilizzare <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">il selettore di modalità</span> per modificare l'hardware utilizzato.","simulator intro 2":"Quindi devi caricare il microcodice (definisce il set di istruzioni) e il codice assembly. <br> Puoi usare <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'> un esempio </span>,  <span class = 'text-primary bg-light' onclick = 'wsweb_select_action(\"checkpoint\");'>caricalo da un file</span>, oppure puoi modificare <span class='text-primary bg-light 'onclick='wsweb_change_workspace_microcode();'>un nuovo microcodice</span> e <span class ='text-primary bg-light 'onclick='wsweb_change_workspace_assembly();'>un nuovo codice assembly</span>. ","simulator intro 3":"Infine, nel simulatore è possibile eseguire il microcodice più assembly precedentemente caricato. <br> È possibile eseguirlo entrambi, a livello di microistruzione o di istruzione di assembly.","Prev.":"Prev.",Next:"Il prossimo",End:"Fine","Disable tutorial mode":"Disattiva la modalità tutorial",Comment:"Commento",Pause:"Pausa",Play:"Giocare",Stop:"Fermare",Record:"Disco",Registers:"Registri","Control Memory":"Control Memory",Stats:"Statistiche",Memory:"Memoria","Keyboard+Display":"Tastiera+display","I/O Stats":"I/O Stats","I/O Configuration":"I/O Configurazione",Recent:"Recente",Refresh:"Ricaricare",Welcome:"Benvenuto","Microcode & Assembly":"Hardware WepSIM","Pick firm/soft":"Scegli il firmware / software da",Information:"Informazioni da",Native:"Nativo","MIPS32-like":"Codice simile a MIPS32",RISCV32:"RISCV32 Codice","Z80-like":"Codice simile a Z80",_last_:"_last_"};i18n.eltos.tutorial_welcome.it={title_0:"Benvenuto nel simulatore WepSIM!",message_0:"<center> <img alt = 'screenshot di wepsim' src = 'images/simulator/simulator012.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Questo breve tutorial ti mostrerà come: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe (\"benvenuto\" , 0,1); '> Carica un esempio. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,2);'> Esegui un esempio. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,3);'> Configura la simulazione. </a> </li> <li> <a href = '#' onclick = 'sim_tutorial_goframe (\"benvenuto\", 0,4); \"> Richiedi assistenza. </a> </li> </ol> </h5>",title_1:"Come caricare un esempio.",message_1:"<center> <img alt = 'screenshot di wepsim' src = 'images/welcome/example_usage.gif' style = 'max-width: 100%; altezza massima: 60vh '> </center> <p> <h5> Fare clic sul pulsante' esempio ', quindi fare clic sul nome' titolo 'di esempio. <br> Quindi l'esempio per microcodice e assieme viene caricato e microcompilato e compilata. <br> </h5>",title_2:"Come eseguire un esempio.",message_2:"<center> <img alt = 'screenshot di wepsim' src = 'images/welcome/simulation_xinstruction.gif' style = 'max-width: 100%; altezza massima: 60vh '> </center> <p> <h5> Fare clic sulle istruzioni/microistruzione successive per eseguire passo dopo passo. <br> Fare clic sul pulsante Esegui per eseguire fino al primo punto di interruzione o alla fine del programma di assemblaggio. <br> </h5>",title_3:"Come configurare WepSIM.",message_3:"<center> <img alt = 'screenshot di wepsim' src = 'images/welcome/config_usage.gif' style = 'max-width: 100%; altezza massima: 60vh '> </center> <p> <h5> Fai clic sul pulsante' configurazione 'e gli utenti possono personalizzare diverse parti di WepSIM. <br> </h5>",title_4:"Come ottenere l'aiuto di base.",message_4:"<center> <img alt = 'screenshot di wepsim' src = 'images/welcome/help_usage.gif' style = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Fare clic sul pulsante verde \"help\" per accedere alla finestra di dialogo della guida. <br> È possibile cambiare idiom (spagnolo/inglese), andare al aiuto indice, o chiudi la finestra di dialogo della guida. <br> </h5>",title_5:"Benvenuto in WepSIM!",message_5:"<center> <img alt = 'screenshot di wepsim' src = 'images/welcome/help_usage.gif' style = 'max-width: 100%; altezza massima: 60vh '> </center> <p> <h5> Esplora le sezioni della guida per ulteriori informazioni. <br> Se fai clic sul pulsante Fine di questo tutorial, WepSIM caricherà il primo esempio per te. Buon divertimento! <br> </h5>",_last_:"_last_"};i18n.eltos.tutorial_simpleusage.it={title_0:"Semplice esperienza WepSIM: microprogrammazione e programmazione",message_0:"<center> <img alt = 'screenshot di wepsim' src = 'images/simulator/simulator011.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Questo breve tutorial ti mostrerà come: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe (\"simpleusage\" , 0,1); '> Modifica il tuo microcodice. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'> Modifica il tuo assembly ( in base al microcodice precedente). </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,5);'> Esegui l'assembly + microcode nella simulazione. </a> </li> </ol> </h5>",title_1:"Semplice esperienza WepSIM: microprogrammazione e programmazione",message_1:"<center> <img alt = 'screenshot di wepsim' src = 'images/simulator/firmware001.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Il primo passo è la microprogrammazione del firmware da utilizzare. Utilizzare il pulsante \"Microcodice\" per passare alla schermata del microcodice. </H5>",title_2:"Semplice esperienza WepSIM: microprogrammazione e programmazione",message_2:"<center> <img alt = 'screenshot di wepsim' src = 'images/simulator/firmware002.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Lo schermo di microprogrammazione fornisce: <ul> <li> L'editor per il microcode. </li> <li> Il microcompilatore. </li> < li> Il riepilogo dell'hardware e la guida. </li> </ul> Una volta che il codice è pronto (compilato senza errori), il passaggio successivo è passare alla schermata dell'assembly. </h5>",title_3:"Semplice esperienza WepSIM: microprogrammazione e programmazione",message_3:"<center> <img alt = 'screenshot di wepsim' src = 'images/simulator/assembly002b.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Il secondo passo è programmare l'assembly da eseguire. Si prega di utilizzare il pulsante 'Assembly' da entrambi, lo schermo del simulatore o lo schermo del microcodice. </H5>",title_4:"Semplice esperienza WepSIM: microprogrammazione e programmazione",message_4:"<center> <img alt = 'screenshot di wepsim' src = 'images/simulator/assembly003.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> La schermata di programmazione fornisce: <ul> <li> L'editor per il codice assembly. </li> <li> Il compilatore di assiemi. </li > <li> Il visualizzatore della mappa della memoria e l'aiuto. </li> </ul> Una volta che il codice assebly è pronto (modificato e compilato senza errori), il passaggio successivo è passare alla schermata di simulazione. </h5>",title_5:"Semplice esperienza WepSIM: microprogrammazione e programmazione",message_5:"<center> <img alt = 'screenshot di wepsim' src = 'images/simulator/simulator010.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Il terzo passo è eseguire il codice assembly nel simulatore. <br> Lo schermo del simulatore fornisce: <ul> <li> La vista di assemblaggio e hardware . </li> <li> La vista dettagliata dei registri, della memoria di controllo, della memoria principale, ecc. </li> <li> Il reset, passo dopo passo o eseguito fino alle azioni di breakpoint/fine. </li> </ul > Questo tutorial ha introdotto l'utilizzo tipico di WepSIM per studenti e insegnanti. Divertiti con WepSIM! </H5>",_last_:"_last_"};i18n.eltos.tour_intro.it={step1:"WepSIM aiuta a capire meglio come funziona un computer: è visivo, interattivo, si integra da segnali fino a interruzioni, chiamate di sistema, eccezioni, ecc. <br> <br> Crediamo veramente che WepSIM sia uno strumento didattico rivoluzionario. Questo breve tour introduce gli elementi chiave della sua interfaccia.",step2:"Questo pulsante in alto a destra è un menu di accesso rapido alle diverse 'modalità di lavoro'.<br>"+"<br>"+"Gli utenti possono selezionare:"+"<ul>"+"<li>L'hardware con cui lavorare (ad es. processore EP, ecc.)</li>"+"<li>Modalità solo assembly, con MIPS<sub>32</sub> interi o RISC-V <sub>32</sub> istruzioni</li>"+"<li>La modalità tutorial, consigliata all'inizio ;-)</li>"+"</ul>",step3:'In alto a destra, il pulsante "Guida" apre la finestra di dialogo associata. <br> <br> La finestra di dialogo della guida riassume le esercitazioni, le descrizioni, le informazioni, ecc.',step4:"E a sinistra, il pulsante 'esempi' apre la finestra di dialogo di esempio. <br> <br> Ci sono molti esempi che possono essere usati per imparare in modo incrementale.",step5:"In alto a sinistra, il pulsante 'configurazione' apre la finestra di configurazione. <br> <br> Permette agli utenti di adattare diversi aspetti dell'esecuzione, dell'interfaccia utente, delle preferenze, ecc.",step6:"Congratulazioni! Conosci gli elementi chiave nell'interfaccia di WepSIM. <br> Dalla finestra di dialogo 'Aiuto' puoi accedere al 'Tutorial di benvenuto' per continuare ad apprendere. <br>",_last_:"_last_"};i18n.eltos.cfg.it={General:"Generale","Idiom for help, examples, etc.":"Idioma per aiuto, esempi, ecc.","Notification speed: time before disapear":"Velocità di notifica: tempo prima che scompaia",Editor:"editore","Editor theme: light or dark":"Tema dell'editor: chiaro o scuro",Light:"Luce",Dark:"Buio","Editor mode: vim, emacs, etc.":"Modalità Editor: vim, emacs, ecc.",Execution:"Esecuzione","Running speed: execution speed":"Velocità di esecuzione: velocità di esecuzione",Slow:"Lento",Normal:"Normale",Fast:"Veloce","Step-by-step: element in run mode":"Procedura dettagliata: elemento in modalità esecuzione",Instructions:"Istruzioni",Instruction:"istruzione","&#181;instructions":"μinstructions",microInstruction:"μInstruction","Breakpoint icon: icon to be used for breakpoints":"Icona punto di interruzione: icona da utilizzare per i punti di interruzione","Limit instructions: number of instructions to be executed":"Istruzioni limite: numero di istruzioni da eseguire","Limit instruction ticks: to limit clock ticks":"Limite di istruzione limite: limite di zecche dell'orologio per istruzione","Register file":"Register file","Display format":"Formato di visualizzazione","Register file names":"Registrare i nomi dei file",Numbers:"Numeri",Labels:"etichette","Editable registers: edit register file values":"Registri modificabili: modifica i valori del file di registro","Circuitry simulation":"Simulazione di circuiti","Data-path color":"Colore percorso dati","Signal color":"Colore del segnale","Show by value or by activation":"Mostra per valore o per attivazione",Value:"Valore",Activation:"Attivazione","Interactive mode: signal value can be updated":"Modalità interattiva: il valore del segnale può essere aggiornato","Quick interactive mode: quick update of signal value":"Modalità interattiva rapida: aggiornamento rapido del valore del segnale","(example)":"(esempio)",Accesibility:"Accessibilità","Active voice: external voice control":"Voce attiva: controllo vocale esterno","Verbalization: textual or mathematical":"Verbalizzazione: testuale o matematica","WepSIM User Interface views":"Viste dell'interfaccia utente di WepSIM",_last_:"_last_"};i18n.eltos.help.it={"Welcome tutorial":"Welcome tutorial",help_01_01:"Apri il tutorial di benvenuto","Simple usage tutorial":"Tutorial di utilizzo semplice",help_01_02:"Apri il tutorial sull'uso semplice, per la microprogrammazione e la programmazione degli assiemi","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"Simulator: firmware",help_02_01:"Come lavorare con il firmware da caricare nella memoria di controllo","Microcode format":"Formato microcodice",help_02_02:"Sintassi del microcodice utilizzato","Simulator: assembly":"Simulatore: assemblaggio",help_02_03:"Come lavorare con l'assembly che utilizza il firmware sopra menzionato","Assembly format":"Formato di assemblaggio",help_02_04:"Sintassi degli elementi di assieme","Simulator: execution":"Simulatore: esecuzione",help_02_05:"Come il simulatore può eseguire l'assemblaggio e il firmware","Simulated architecture":"Architettura simulata",help_03_01:"Descrizione dell'architettura del processore simulato","Simulated signals":"Segnali simulati",help_03_02:"Riassunto dei segnali principali del processore elementare simulato","Hardware summary":"Riepilogo hardware",help_03_03:"Scheda di riferimento per l'hardware del processore elementare simulato","License, platforms, etc.":"Licenza, piattaforme, ecc.",help_04_01:"Licenza WepSIM, piattaforme supportate, tecnologie utilizzate",Authors:"autori",help_04_02:"Autori di WepSIM",_last_:"_last_"};i18n.eltos.states.it={States:"stati",Current:"attuale","Current State":"Stato attuale",History:"Storia",None:"Nessuna","Empty history":"Storia vuota","Empty (only modified values are shown)":"Vuoto (vengono mostrati solo i valori modificati)",Differences:"differenze","differences with clipboard state":"differenze con lo stato degli appunti","Meets the specified requirements":"Soddisfa i requisiti specificati",history:"storia",Add:"Inserisci","'Current State' to History":"'Current State' to History",Check:"Dai un'occhiata",Copy:"copia","to clipboard":"negli appunti",Checkpoint:"posto di controllo","File name":"File name","Tag for checkpoint":"Tag per checkpoint","File to be loaded":"File da caricare","Save to File":"Salva su file","State(s) to checkpoint":"Stato / i al punto di controllo","Record to checkpoint":"Registra al punto di controllo","Browser cache":"Browser cache","Session to be restore":"Sessione da ripristinare",_last_:"_last_"};i18n.eltos.examples.it={"addv + seqv.":"addv + seqv.","Alloc.s":"Alloc.s","Dummy instruction":"Istruzione fittizia",Exception:"Eccezione",Instructions:"Istruzioni",Interruptions:"interruzioni","Int. + syscall + except.":"Int. + syscall + tranne","I/O":"H/O",Looping:"looping","madd, mmul, mxch":"Aiuto, umore, mente","Masks & shift":"Maschere e maiuscole",Matrix:"Matrice","Memory access":"Accesso alla memoria","SC 1, 4-5, 8, 11-12":"SC 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"sottoprogramma","syscall 1, 4-5, 8, 11-12":"syscall 1, 4-5, 8, 11-12","System call":"Chiamata di sistema",Threads:"discussioni",Vector:"Vettore","Compiler Explorer":"Compiler Explorer",example_04_01:"Esempio avanzato con interruzione, chiamata di sistema ed eccezione.",example_05_01:"Estensione specifica dell'applicazione: addv + seqv.",example_05_03:"Estensione specifica dell'applicazione: madd + mmul + mxch.",example_05_02:"Estensione specifica dell'applicazione: strlen_2 + skipasciicode_2.",example_03_01:"<b> Esempio istruttivo </b> con eccezione in virgola mobile.",example_03_02:"<b> Esempio istruttivo </b> con supporto per interruzioni: fetch, RETI e .ktext/.kdata.",example_03_03:"<b> Esempio istruttivo </b> con supporto per le chiamate di sistema.",example_04_04:"Esempio di malloc + gratuito.",example_04_02:"Esempio di syscall per la stampa/lettura di interi e stringhe.",example_04_03:"Esempio di thread.",example_03_01b:"Esempio con eccezione in virgola mobile.",example_03_02b:"Esempio con supporto per interruzioni: fetch, RETI e .ktext/.kdata.",example_02_01:"Esempio con accesso I/O programmato e segmento .text/.data di base.",example_03_03b:"Esempio con supporto per le chiamate di sistema.",example_02_02:"Esempio esteso con più istruzioni e I/O (tastiera, display).",example_02_04:"Esempio esteso con subrutine e matrice.",example_02_03:"Esempio più esteso con maschere, maiuscole e segmento .text/.data di base.",example_01_01:"Semplice esempio con fetch, istruzioni aritmetiche e segmento .text di base.",example_01_04:"Semplice esempio con fetch, branch e basic .text/.data segment.",example_01_03:"Semplice esempio con fetch, ramo e segmento .text di base.",example_01_02:"Semplice esempio con recupero, accesso alla memoria e segmento .text/.data di base.",example_06_01:"Esempio di prova",example_06_02:"Esempio di Simple Compiler Explorer.",Advanced:"Avanzate",Initial:"Iniziale",Intermediate:"Intermedio",Laboratory:"Laboratorio","Operating Systems":"Sistemi operativi",Special:"Speciale","Load example":"Carica esempio","Load Assembly only":"Carica solo il gruppo","Load Firmware only":"Carica solo il firmware","Copy reference to clipboard":"Copia il riferimento negli appunti",Share:"Condividi","No examples available...":"Non sono disponibili esempi per l'hardware selezionato","Simple example":"Semplice esempio",_last_:"_last_"};i18n.eltos.dialogs.it={"Show/Hide ActionBar":"Mostra / Nascondi ActionBar","Show/Hide Slider":"Mostra / nascondi cursore","WepSIM User Interface skin":"Skin dell'interfaccia utente WepSIM","Initial intro":"Intro iniziale","About WepSIM":"Informazioni su WepSIM",Title:"Titolo",Message:"Messaggio",Duration:"Durata","Confirm remove record...":"Vuoi rimuovere il record attuale?","Close or Reset...":"Fare clic su Chiudi per mantenerlo, <br> o fare clic sul pulsante Ripristina per rimuoverlo.","Sure Control Memory...":"Vuoi che salvi i contenuti correnti della Control Memory piuttosto che i contenuti dell'editor ?.","Show/Hide labels":"Mostra / nascondi etichette","Show/Hide content":"Mostra / Nascondi contenuto","Show/Hide assembly":"Mostra / nascondi assembly","Show/Hide pseudo-instructions":"Mostra / nascondi pseudo-istruzioni",Close:"Vicino",_last_:"_last_"};i18n.eltos.gui.pt={"Loading WepSIM...":"Carregando o WepSIM ...",Configuration:"Configuração",MicroCode:"MicroCode",Assembly:"Montagem",Simulator:"Simulador",Examples:"Exemplos",Load:"Carga",Save:"Guardar","Load/Save":"Carga/Guardar",Restore:"Restaurar",Help:"Socorro",Notifications:"Notificações",RecordBar:"Barra de registro",Input:"Entrada",Output:"Saída","Help Index":"Índice de Ajuda",Processor:"Processador","Assembly Debugger":"Depurador de montagem",Reset:"Restabelecer",microInstruction:"µInstrução",Instruction:"Instrução",Run:"Corre","Hardware Summary":"Resumo de hardware",processor:"processador",details:"detalhes",microcode:"microcódigo",Signals:"Sinais",Behaviors:"Comportamentos",States:"Estados","Control States":"Estados de controle",Dependencies:"Dependências",Close:"Perto",Description:"Descrição",Show:"exposição","Show Main Memory":"Mostrar memória principal",compile:"compilar",Compile:"Compilar","Please write the file name":"Por favor, escreva o nome do arquivo","Load from this File":"Carregar deste arquivo",labels:"rótulos",addr:"addr",ess:"ess",content:"conteúdo",assembly:"montagem",instructions:"instruções","simulator intro 1":"Você pode selecionar o hardware a ser usado. O padrão é o hardware EP (Elemental Processor). <br> Você pode usar o dropdown <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">o seletor de modo</span> para alterar o hardware usado.","simulator intro 2":"Então você precisa carregar o microcódigo (define o conjunto de instruções) e o código assembly. <br> Você pode usar <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'>um exemplo</span>, <span class='text-primary bg-light'onclick='wsweb_select_action(\"checkpoint\");'>carrega de um arquivo</span>, ou você pode editar <span class='text-primary bg-light' onclick='wsweb_change_workspace_microcode();'>um novo microcódigo</span> e <span class='text-primary bg-light' onclick='wsweb_change_workspace_assembly();'>um novo código de montagem</span>.","simulator intro 3":"Finalmente, no simulador você é capaz de executar o microcódigo plus montado antes. Você pode executá-lo em nível de microinstrução ou em nível de instrução de montagem.","Prev.":"Prev.",Next:"Próximo",End:"Fim","Disable tutorial mode":"Desativar o modo tutorial",Comment:"Comente",Pause:"Pausa",Play:"Toque",Stop:"Pare",Record:"Registro",Registers:"Registos","Control Memory":"Control Memory",Stats:"Estatisticas",Memory:"Memória","Keyboard+Display":"Teclado + Display","I/O Stats":"Estatisticas de E/S","I/O Configuration":"Configuração de E/S",Recent:"Recente",Refresh:"Atualizar",Welcome:"Bem vindo","Microcode & Assembly":"WepSIM hardware","Pick firm/soft":"Escolha firmware/software de",Information:"Informação de",Native:"Nativo","MIPS32-like":"Semelhante ao MIPS32",RISCV32:"RISCV32","Z80-like":"Semelhante ao Z80",_last_:"_last_"};i18n.eltos.tutorial_welcome.pt={title_0:"Bem-vindo ao simulador WepSIM!",message_0:"<center> <img alt = 'captura de tela do wepsim' src = 'images/simulator/simulator012.jpg' estilo = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Este breve tutorial mostrará como: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe (\"bem-vindo\" , 0,1); '> Carregue um exemplo. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\".0,2);'> Execute um exemplo. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,3);'> Configure a simulação. </a> </li> <li> <a href = '#' onclick = 'sim_tutorial_goframe (\"bem-vindo\", 0,4);'> Obter ajuda. </a> </li> </ol> </h5>",title_1:"Como carregar algum exemplo.",message_1:"<center> <img alt = 'captura de tela do wepsim' src = 'images/welcome/example_usage.gif' estilo = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Clique no botão' example ', depois clique no nome do exemplo' title '. <br> Então o exemplo para microcode e assembly é carregado e microcompilado e compilado. <br> <br> </h5>",title_2:"Como executar um exemplo",message_2:"<center> <img alt = 'Captura de tela do wepsim' src = 'images/welcome/simulation_xinstruction.gif' estilo = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Clique na próxima instrução/microinstrução para executar passo a passo. <br> Clique no botão de execução para executar até o primeiro ponto de interrupção ou o final do programa de montagem. <br> </h5>",title_3:"Como configurar o WepSIM.",message_3:"<center> <img alt = 'captura de tela do wepsim' src = 'images/welcome/config_usage.gif' estilo = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Clique no botão' configuração 'e os usuários podem personalizar diferentes partes do WepSIM. <br> </h5>",title_4:"Como obter ajuda básica",message_4:"<center> <img alt = 'captura de tela do wepsim' src = 'images/welcome/help_usage.gif' estilo = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Clique no botão verde' help 'para acessar a janela de ajuda. <br> Você pode mudar de idioma (espanhol/inglês), vá para o índice de ajuda ou feche a caixa de diálogo de ajuda. <br> </h5>",title_5:"Bem vindo ao WepSIM!",message_5:"<center> <img alt = 'captura de tela do wepsim' src = 'images/welcome/help_usage.gif' estilo = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Por favor, explore as seções de ajuda para mais informações. <br> Se você clicar no botão final deste tutorial, o WepSIM carregará o primeiro exemplo para você. Aproveite! <br> </h5>",_last_:"_last_"};i18n.eltos.tutorial_simpleusage.pt={title_0:"Experiência simples em WepSIM: microprogramação e programação",message_0:"<center> <img alt = 'captura de tela do wepsim' src = 'images/simulator/simulator011.jpg' estilo = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Este breve tutorial mostrará como: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe (\"simpleusage\" , 0,1); '> Edite seu microcódigo. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'> Edite sua montagem ( baseado no microcódigo anterior. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\".0,5);'> Execute a montagem + microcódigo na simulação. </a> </li> </ol> </h5>",title_1:"Experiência simples em WepSIM: microprogramação e programação",message_1:"<center> <img alt = 'captura de tela do wepsim' src = 'images/simulator/firmware001.jpg' estilo = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> O primeiro passo é microprogramar o firmware a ser usado. Por favor, use o botão 'Microcode' para mudar para a tela do microcódigo. </H5>",title_2:"Experiência simples em WepSIM: microprogramação e programação",message_2:"<center> <img alt = 'captura de tela do wepsim' src = 'images/simulator/firmware002.jpg' estilo = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> A tela de microprogramação fornece: <ul> <li> O editor para o microcódigo. </li> <li> O microcompilador. </li> < li> O resumo de hardware e ajuda. </li> </ul> Uma vez que seu código está pronto (compilado sem erros), o próximo passo é ir para a tela de montagem. </h5>",title_3:"Experiência simples em WepSIM: microprogramação e programação",message_3:"<center> <img alt = 'captura de tela do wepsim' src = 'images/simulator/assembly002b.jpg' estilo = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> O segundo passo é programar a montagem a ser executada. Por favor, use o botão 'Assembly' de ambos, a tela do simulador ou a tela do microcódigo. </H5>",title_4:"Experiência simples em WepSIM: microprogramação e programação",message_4:"<center> <img alt = 'captura de tela do wepsim' src = 'images/simulator/assembly003.jpg' estilo = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> A tela de programação fornece: <ul> <li> O editor para o código assembly. </li> <li> O compilador assembly. </li > <li> O visualizador do mapa de memória e ajuda. </li> </ul> Uma vez que seu código está pronto (editado e compilado sem erros) o próximo passo é ir para a tela de simulação. </h5>",title_5:"Experiência simples em WepSIM: microprogramação e programação",message_5:"<center> <img alt = 'captura de tela do wepsim' src = 'images/simulator/simulator010.jpg' estilo = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> A terceira etapa é executar o código de montagem no simulador. <br> A tela do simulador fornece: <ul> <li> A exibição de montagem e hardware . </li> <li> A visualização detalhada dos registros, memória de controle, memória principal, etc. </li> <li> A redefinição, passo a passo ou é executada até as ações de ponto de interrupção/final. </li> </ul > Este tutorial introduziu o uso típico do WepSIM para alunos e professores. Aproveite o WepSIM! </H5>",_last_:"_last_"};i18n.eltos.tour_intro.pt={step1:"O WepSIM ajuda a entender melhor como funciona um computador: é visual, interativo, integra desde sinais até interrupções, chamadas de sistema, exceções, etc. <br> <br> Nós realmente acreditamos que o WepSIM é uma ferramenta de ensino revolucionária. Este breve tour apresenta os principais elementos de sua interface.",step2:"Este botão no canto superior direito é um menu de acesso rápido aos diferentes 'modos de trabalho'. <br>"+"<br>"+"Os usuários podem selecionar:"+"<ul>"+"<li>O hardware para trabalhar (por exemplo, processador EP, etc.)</li>"+"<li>Modo somente montagem, com instruções MIPS<sub>32</sub> inteiras ou RISC-V<sub>32</sub></li>"+"<li>O modo tutorial, recomendado no início ;-)</li>"+"</ul>",step3:"No canto superior direito, o botão 'ajuda' abre a caixa de diálogo associada. <br> <br> A caixa de diálogo de ajuda resume os tutoriais, descrições, informações etc.",step4:"E à esquerda, o botão 'exemplos' abre o diálogo de exemplo. <br> <br> Há muitos exemplos que podem ser usados ​​para aprender de forma incremental.",step5:"No canto superior esquerdo, o botão 'configuração' abre o diálogo de configuração. <br> <br> Permite que os usuários adaptem vários aspectos da execução, interface do usuário, preferências, etc.",step6:"Parabéns! Você conhece os elementos-chave na interface do WepSIM. <br> Na caixa de diálogo 'Ajuda', você pode acessar o 'tutorial de boas-vindas' para continuar aprendendo. <br>",_last_:"_last_"};i18n.eltos.cfg.pt={General:"Geral","Idiom for help, examples, etc.":"Idioma para ajuda, exemplos, etc.","Notification speed: time before disapear":"Velocidade de notificação: tempo antes de desaparecer",Editor:"editor","Editor theme: light or dark":"Tema do editor: claro ou escuro",Light:"Leve",Dark:"Sombrio","Editor mode: vim, emacs, etc.":"Editor mode: vim, emacs, etc.",Execution:"Execução","Running speed: execution speed":"Velocidade de corrida: velocidade de execução",Slow:"Lento",Normal:"Normal",Fast:"Rápido","Step-by-step: element in run mode":"Passo-a-passo: elemento no modo de execução",Instructions:"Instruções",Instruction:"Instrução","&#181;instructions":"instruções",microInstruction:"µInstrução","Breakpoint icon: icon to be used for breakpoints":"Ícone de ponto de interrupção: ícone a ser usado para pontos de interrupção","Limit instructions: number of instructions to be executed":"Instruções de limite: número de instruções a serem executadas","Limit instruction ticks: to limit clock ticks":"Limite de ticks de instrução: clock ticks limit por instrução","Register file":"Registrar arquivo","Display format":"Formato de apresentação","Register file names":"Registre nomes de arquivos",Numbers:"Números",Labels:"Rótulos","Editable registers: edit register file values":"Registradores editáveis: edite os valores do arquivo de registro","Circuitry simulation":"Simulação de circuitos","Data-path color":"Cor do caminho de dados","Signal color":"Cor do sinal","Show by value or by activation":"Mostrar por valor ou por ativação",Value:"Valor",Activation:"Ativação","Interactive mode: signal value can be updated":"Modo interativo: valor do sinal pode ser atualizado","Quick interactive mode: quick update of signal value":"Modo interativo rápido: atualização rápida do valor do sinal","(example)":"(exemplo)",Accesibility:"Acessibilidade","Active voice: external voice control":"Voz ativa: controle de voz externo","Verbalization: textual or mathematical":"Verbalização: textual ou matemática","WepSIM User Interface views":"Visualizações da Interface do Usuário WepSIM",_last_:"_last_"};i18n.eltos.help.pt={"Welcome tutorial":"Welcome tutorial",help_01_01:"Abra o tutorial de boas vindas","Simple usage tutorial":"Tutorial de uso simples",help_01_02:"Abra o tutorial de uso simples, para programação de microprogramação e montagem","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"Simulador: firmware",help_02_01:"Como trabalhar com o firmware a ser carregado na memória de controle","Microcode format":"Formato de microcódigo",help_02_02:"Sintaxe do microcódigo usado","Simulator: assembly":"Simulador: montagem",help_02_03:"Como trabalhar com o assembly que usa o firmware mencionado","Assembly format":"Formato de montagem",help_02_04:"Sintaxe dos elementos de montagem","Simulator: execution":"Simulador: execução",help_02_05:"Como o simulador pode executar a montagem e o firmware","Simulated architecture":"Arquitetura simulada",help_03_01:"Descrição da arquitetura do processador simulado","Simulated signals":"Sinais simulados",help_03_02:"Resumo dos sinais principais do processador elementar simulado","Hardware summary":"Resumo de hardware",help_03_03:"Cartão de referência para o hardware do processador elementar simulado","License, platforms, etc.":"Licença, plataformas, etc.",help_04_01:"Licença WepSIM, plataformas suportadas, tecnologias usadas",Authors:"Autores",help_04_02:"Autores do WepSIM",_last_:"_last_"};i18n.eltos.states.pt={States:"Estados",Current:"Atual","Current State":"Estado atual",History:"História",None:"Nenhum","Empty history":"História vazia","Empty (only modified values are shown)":"Vazio (apenas valores modificados são mostrados)",Differences:"Diferenças","differences with clipboard state":"diferenças com o estado da área de transferência","Meets the specified requirements":"Atende aos requisitos especificados",history:"história",Add:"Adicionar","'Current State' to History":"'Estado atual' para a história",Check:"Verifica",Copy:"cópia de","to clipboard":"para a área de transferência",Checkpoint:"Ponto de verificação","File name":"Nome do arquivo","Tag for checkpoint":"Tag para checkpoint","File to be loaded":"Arquivo a ser carregado","Save to File":"Salvar em arquivo","State(s) to checkpoint":"Estado (s) para checkpoint","Record to checkpoint":"Gravar no ponto de verificação","Browser cache":"Cache do navegador","Session to be restore":"Sessão a ser restaurada",_last_:"_last_"};i18n.eltos.examples.pt={"addv + seqv.":"addv + seqv.","Alloc.s":"Alloc.s","Dummy instruction":"Instrução de manequim",Exception:"Exceção",Instructions:"Instruções",Interruptions:"Interrupções","Int. + syscall + except.":"Int. + syscall + exceto.","I/O":"I/O",Looping:"Looping","madd, mmul, mxch":"Ajuda, humor, mente","Masks & shift":"Máscaras e turno",Matrix:"Matriz","Memory access":"Acesso à memória","SC 1, 4-5, 8, 11-12":"SC 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"Sub-rotina","syscall 1, 4-5, 8, 11-12":"syscall 1, 4-5, 8, 11-12","System call":"Chamada de sistema",Threads:"Tópicos",Vector:"Vetor","Compiler Explorer":"Compiler Explorer",example_04_01:"Exemplo avançado com interrupção, chamada de sistema e exceção.",example_05_01:"Extensão específica do aplicativo: addv + seqv.",example_05_03:"Extensão específica da aplicação: madd + mmul + mxch.",example_05_02:"Extensão específica do aplicativo: strlen_2 + skipasciicode_2.",example_03_01:"Exemplo <b> Instrutivo </b> com exceção de ponto flutuante.",example_03_02:"Exemplo de <b> Instructive </b> com suporte a interrupções: fetch, RETI e .ktext/.kdata.",example_03_03:"Exemplo <b> Instrutivo </b> com suporte a chamadas do sistema.",example_04_04:"Exemplo de malloc + free.",example_04_02:"Exemplo de syscall para impressão/leitura de inteiros e string.",example_04_03:"Exemplo de encadeamentos.",example_03_01b:"Exemplo com exceção de ponto flutuante.",example_03_02b:"Exemplo com suporte a interrupções: fetch, RETI e .ktext/.kdata.",example_02_01:"Exemplo com acesso de E/S programado e segmento básico .text/.data.",example_03_03b:"Exemplo com suporte a chamada do sistema.",example_02_02:"Exemplo estendido com mais instruções e E/S (teclado, display).",example_02_04:"Exemplo estendido com subrutina e matriz.",example_02_03:"Exemplo mais extenso com máscaras, deslocamento e segmento básico .text/.data.",example_01_01:"Exemplo simples com busca, instruções aritméticas e segmento básico de texto.",example_01_04:"Exemplo simples com busca, ramificação e segmento básico .text/.data.",example_01_03:"Exemplo simples com busca, ramificação e segmento .text básico.",example_01_02:"Exemplo simples com busca, acesso à memória e segmento básico .text/.data.",example_06_01:"Exemplo de teste",example_06_02:"Exemplo simples do Explorador de Compiladores.",Advanced:"Advanced",Initial:"Inicial",Intermediate:"Intermediário",Laboratory:"Laboratório","Operating Systems":"Sistemas operacionais",Special:"Especial","Load example":"Carregar exemplo","Load Assembly only":"Carregar apenas o conjunto","Load Firmware only":"Carregar apenas firmware","Copy reference to clipboard":"Copiar referência à área de transferência",Share:"Compartilhar","No examples available...":"Não há exemplos disponíveis para o hardware selecionado","Simple example":"Exemplo simples.",_last_:"_last_"};i18n.eltos.dialogs.pt={"Show/Hide ActionBar":"Mostrar / Ocultar ActionBar","Show/Hide Slider":"Mostrar / Ocultar Slider","WepSIM User Interface skin":"Skin da Interface do Usuário WepSIM","Initial intro":"Introdução inicial","About WepSIM":"Sobre o WepSIM",Title:"Título",Message:"mensagem",Duration:"Duração","Confirm remove record...":"Você quer remover o registro real?","Close or Reset...":"Por favor, clique em Fechar para mantê-lo, ou clique no botão Redefinir para removê-lo.","Sure Control Memory...":"Você quer que eu salve o conteúdo atual da Control Memory em vez do conteúdo do editor ?.","Show/Hide labels":"Mostrar / ocultar etiquetas","Show/Hide content":"Mostrar / ocultar conteúdo","Show/Hide assembly":"Mostrar / ocultar montagem","Show/Hide pseudo-instructions":"Mostrar / ocultar pseudo-instruções",Close:"Perto",_last_:"_last_"};i18n.eltos.gui.hi={"Loading WepSIM...":"लोड हो रहा है ...",Configuration:"विन्यास",MicroCode:"माइक्रोकोड",Assembly:"सभा",Simulator:"सिम्युलेटर",Examples:"उदाहरण",Load:"भार",Save:"बचाना",Restore:"पुनर्स्थापित",Help:"मदद",Notifications:"सूचनाएं दिखाएं",RecordBar:"रिकॉर्डबोर दिखाएँ / छिपाएँ",Input:"इनपुट",Output:"उत्पादन","Help Index":"मदद सूचकांक",Processor:"प्रोसेसर","Assembly Debugger":"विधानसभा डिबगर",Reset:"रीसेट",microInstruction:"μअनुदेश",Instruction:"अनुदेश",Run:"रन","Hardware Summary":"हार्डवेयर सारांश",processor:"प्रोसेसर",details:"विवरण",microcode:"माइक्रोकोड",Signals:"सिग्नल",Behaviors:"व्यवहार",States:"राज्य अमेरिका","Control States":"नियंत्रण राज्यों",Dependencies:"निर्भरता",Close:"बंद करे",Description:"विवरण",Show:"प्रदर्शन","Show Main Memory":"मुख्य मेमोरी दिखाएँ",compile:"संकलन",Compile:"संकलित करें","Please write the file name":"कृपया फ़ाइल का नाम लिखें","Load from this File":"इस फ़ाइल से लोड करें",labels:"लेबल",addr:"addr",ess:"ईएसएस",content:"सामग्री",assembly:"सभा",instructions:"अनुदेश","simulator intro 1":"आप उपयोग किए जाने वाले हार्डवेयर का चयन कर सकते हैं। डिफ़ॉल्ट एक EP (एलिमेंटल प्रोसेसर) हार्डवेयर है। <br> आप <span onclick=\"$class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\"> उपयोग किए गए हार्डवेयर को बदलने के लिए।","simulator intro 2":"फिर आपको माइक्रोकोड (निर्देश सेट को परिभाषित करता है) और असेंबली कोड लोड करने की आवश्यकता है। <br> आप <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'> एक उदाहरण </span>, <span class=' text-primary bg-light' onclick=' wsweb_select_action(\"checkpoint\");;>> इसे फ़ाइल से लोड करें </span>, या आप संपादित कर सकते हैं <span class='text-primary bg-light' onclick= 'wsweb_change_workspace_microcode();'> एक नया माइक्रोकोड </span> और <span class='text-primary bg-light' onclick='wsweb_change_workspace_assembly();'> एक नया असेंबली कोड </span>।","simulator intro 3":"अंत में, सिम्युलेटर में आप पहले से लोड किए गए माइक्रोकोड प्लस असेंबली को निष्पादित करने में सक्षम हैं। <br> आप इसे माइक्रोइन्स्ट्रक्शन स्तर या असेंबली इंस्ट्रक्शन स्तर पर दोनों निष्पादित कर सकते हैं।","Prev.":"पिछला।",Next:"आगामी",End:"समाप्त","Disable tutorial mode":"ट्यूटोरियल मोड को अक्षम करें",Comment:"टिप्पणी",Pause:"ठहराव",Play:"प्ले",Stop:"रुकें",Record:"अभिलेख",Registers:"रजिस्टर","Control Memory":"मेमोरी को नियंत्रित करें",Stats:"आँकड़े",Memory:"याद","Keyboard+Display":"कीबोर्ड + प्रदर्शन","I/O Stats":"मैं / हे आँकड़े","I/O Configuration":"मैं / हे विन्यास",Recent:"हाल का",Refresh:"ताज़ा करना",Welcome:"स्वागत हे","Microcode & Assembly":"WepSIM हार्डवेयर","Pick firm/soft":"फर्मवेयर / सॉफ्टवेयर से चुनें",Information:"से जानकारी",Native:"देशी","MIPS32-like":"MIPS32- जैसा कोड",RISCV32:"RISCV32 कोड","Z80-like":"Z80- जैसा कोड",_last_:"_last_"};i18n.eltos.tutorial_welcome.hi={title_0:"WepSIM सिम्युलेटर में आपका स्वागत है!",message_0:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / सिम्युलेटर / Simulator012.jpg' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 40vh; '> </ केंद्र> <p> <h5> यह संक्षिप्त ट्यूटोरियल आपको यह दिखाने जा रहा है कि कैसे: <ol> <li> <a href =' # 'onclick =' sim_tutorial_boframe (\"वेलकम\") , 0,1); '> एक उदाहरण लोड करें। </a> </ li> <li> <a href='#' onclick= anim_tutorial_goframe(\"welcome\",0,2);'> उदाहरण का चयन करें; </a> </ li> <li> <a href='#' onclick= anim_tutorial_goframe(\"welcome\",0,3);'> सिमुलेशन को कॉन्फ़िगर करें। </a> </ li> <li> < a href = '#' onclick = 'sim_tutorial_goframe (\"स्वागत\", 0,4);>> सहायता प्राप्त करें। </a> </ li> </ ol> </ h5>",title_1:"कुछ उदाहरण कैसे लोड करें।",message_1:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / स्वागत / example_usage.gif' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 60vh '> </ केंद्र> <p> <h5>' उदाहरण 'बटन में क्लिक करें, फिर उदाहरण' शीर्षक 'नाम में क्लिक करें। <br> फिर माइक्रोकोड और असेंबली के लिए उदाहरण लोड किया गया है और माइक्रो कंप्यूटर किया गया है। संकलित। <br> <br> </ h5>",title_2:"कैसे एक उदाहरण निष्पादित करने के लिए।",message_2:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / स्वागत / अनुकार / अनुकरण_जीआरआई' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 60vh '> </ केंद्र> <p> <h5> कदम से कदम निष्पादित करने के लिए अगले निर्देश / microinstruction पर क्लिक करें। <br> पहला ब्रेकपॉइंट या असेंबली प्रोग्राम के अंत तक निष्पादित करने के लिए रन बटन पर क्लिक करें। <br> </ h5>",title_3:"WepSIM को कैसे कॉन्फ़िगर करें।",message_3:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / स्वागत / config_usage.gif' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 60vh '> </ केंद्र> <p> <h5>' कॉन्फ़िगरेशन 'बटन में क्लिक करें और उपयोगकर्ता WepSIM के विभिन्न भागों को अनुकूलित करने में सक्षम हैं। <br> </ h5>",title_4:"मूल सहायता कैसे प्राप्त करें।",message_4:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / स्वागत / help_usage.gif' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 60vh '> </ केंद्र> <p> <h5> कृपया सहायता संवाद तक पहुंचने के लिए हरे' सहायता 'बटन में क्लिक करें। <br> आप मुहावरे (स्पेनिश / अंग्रेजी) को स्विच करने में सक्षम हैं, पर जाएं। मदद इंडेक्स, या हेल्प डायलॉग बंद करें। <br> </ h5>",title_5:"WepSIM में आपका स्वागत है!",message_5:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / स्वागत / help_usage.gif' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 60vh '> </ केंद्र> <p> <h5> कृपया अधिक जानकारी के लिए सहायता अनुभाग देखें। <br> यदि आप इस ट्यूटोरियल के अंतिम बटन पर क्लिक करते हैं, तो WepSIM आपके लिए पहला उदाहरण लोड करने जा रहा है। का आनंद लें! <br> </ h5>",_last_:"_last_"};i18n.eltos.tutorial_simpleusage.hi={title_0:"सरल WepSIM अनुभव: माइक्रोप्रोग्रामिंग और प्रोग्रामिंग",message_0:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / सिम्युलेटर / सिमुलेटर011.jpg' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 40vh; '> </केंद्र> <p> <h5> यह संक्षिप्त ट्यूटोरियल आपको यह दिखाने जा रहा है कि कैसे: <ol> <li> <a href =' # 'onclick =' sim_tutorial_boframe (\"सिंपलस\") , 0,1);>> अपना माइक्रोकोड संपादित करें। </a> </li> <li> <a href='#' onclick= anim_tutorial_goframe(\"simpleusage\",0,3);;;; पिछले माइक्रोकोड के आधार पर)। </a> </li> <li> <a href='#' onclick= anim_tutorial_goframe(\"simpleusage\",0,5);'> सिमुलेशन में असेंबली / माइक्रोकोड निष्पादित करें। </a> </li> </ol> </h5>",title_1:"सरल WepSIM अनुभव: माइक्रोप्रोग्रामिंग और प्रोग्रामिंग",message_1:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / सिम्युलेटर / फर्मवेयर001.jpg' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 40vh; '> </केंद्र> <p> <h5> पहला कदम फर्मवेयर को माइक्रोप्रोग्राम करने के लिए उपयोग किया जाना है। कृपया माइक्रोकोड स्क्रीन पर स्विच करने के लिए 'माइक्रोकोड' बटन का उपयोग करें। </h5>",title_2:"सरल WepSIM अनुभव: माइक्रोप्रोग्रामिंग और प्रोग्रामिंग",message_2:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / सिम्युलेटर / फर्मवेयर002.jpg' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 40vh; '> </केंद्र> <p> <h5> माइक्रोप्रोग्रामिंग स्क्रीन प्रदान करता है: <ul> <li> माइक्रोकोड के लिए संपादक। </li> <li> माइक्रो कंप्यूटर </li> <। li> हार्डवेयर सारांश और मदद। </li> </ul> एक बार जब आपका कोड तैयार हो जाता है (त्रुटियों के बिना संकलित), तो अगला चरण विधानसभा स्क्रीन पर जाना है। </h5>",title_3:"सरल WepSIM अनुभव: माइक्रोप्रोग्रामिंग और प्रोग्रामिंग",message_3:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / सिम्युलेटर / असेंबली 002.jpg' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 40vh; '> </केंद्र> <p> <h5> दूसरा चरण विधानसभा को निष्पादित करने के लिए प्रोग्रामिंग करना है। कृपया 'असेंबली' बटन का प्रयोग करें, सिम्युलेटर स्क्रीन या माइक्रोकोड स्क्रीन दोनों। </h5>",title_4:"सरल WepSIM अनुभव: माइक्रोप्रोग्रामिंग और प्रोग्रामिंग",message_4:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / सिम्युलेटर / असेंबली003.jpg' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 40vh; '> </केंद्र> <p> <h5> प्रोग्रामिंग स्क्रीन प्रदान करता है: <ul> <li> असेंबली कोड के लिए संपादक। </li> <li> असेंबली कंपाइलर। </li > <li> मेमोरी मैप व्यूअर और मदद। </li> </ul> एक बार जब आपका assebly कोड तैयार हो जाता है (संपादित और त्रुटियों के बिना संकलित) तो अगला चरण सिमुलेशन स्क्रीन में जाना है। </h5>",title_5:"सरल WepSIM अनुभव: माइक्रोप्रोग्रामिंग और प्रोग्रामिंग",message_5:"<केंद्र> <img alt = 'wepsim स्क्रीनशॉट' src = 'मदद / सिम्युलेटर / Simulator010.jpg' शैली = 'अधिकतम-चौड़ाई: 100%; अधिकतम ऊंचाई: 40vh; '> </केंद्र> <p> <h5> तीसरा चरण सिम्युलेटर में विधानसभा कोड निष्पादित करना है। <br> सिम्युलेटर स्क्रीन प्रदान करता है: <ul> <li> विधानसभा और हार्डवेयर दृश्य । > इस ट्यूटोरियल ने छात्रों और शिक्षकों के लिए WepSIM के विशिष्ट उपयोग की शुरुआत की है। WepSIM का आनंद लें! </H5>",_last_:"_last_"};i18n.eltos.tour_intro.hi={step1:"WepSIM बेहतर तरीके से यह समझने में मदद करता है कि कंप्यूटर कैसे काम करता है: यह दृश्य है, इंटरैक्टिव है, संकेतों से लेकर रुकावट, सिस्टम कॉल, अपवाद आदि तक एकीकृत करता है। <br> <br> हम वास्तव में मानते हैं कि WepSIM एक क्रांतिकारी शिक्षण उपकरण है। यह संक्षिप्त दौरा इसके इंटरफेस के प्रमुख तत्वों का परिचय देता है।","step 2":"टॉप-राइट पर यह बटन डिफरेंशियल वर्क मोड के लिए क्विक एक्सेस मेनू है। <br>"+"<br>"+"उपयोगकर्ता चुन सकते हैं:"+"<ul>"+"<li> हार्डवेयर के साथ काम करने के लिए (जैसे EP प्रोसेसर, आदि।) </ i>"+"<li> केवल मोड, पूर्णांक MIPS के साथ <sub> 32 </ sub> या RISC-V <उप> 32 </ sub> निर्देश </ i>"+"<li> ट्यूटोरियल मोड, शुरुआत में अनुशंसित; -) </ i>"+"</ul>",step3:"शीर्ष-दाईं ओर, 'मदद' बटन संबंधित संवाद खोलता है। <br> <br> मदद संवाद ट्यूटोरियल, विवरण, सूचना, आदि को सारांशित करता है।",step4:"और बाईं ओर, 'उदाहरण' बटन उदाहरण संवाद को खोलता है। <br> <br> कई उदाहरण हैं जिनका उपयोग आकस्मिक रूप से सीखने के लिए किया जा सकता है।",step5:"शीर्ष-बाईं ओर, 'कॉन्फ़िगरेशन' बटन कॉन्फ़िगरेशन संवाद खोलता है। <br> <br> यह उपयोगकर्ताओं को निष्पादन के कई पहलुओं, उपयोगकर्ता इंटरफ़ेस, वरीयताओं, आदि को अनुकूलित करने देता है।",step6:"Congrat! आप WepSIM इंटरफ़ेस के प्रमुख तत्वों को जानते हैं। <br> 'सहायता' संवाद से आप सीखने को जारी रखने के लिए 'वेलकम ट्यूटोरियल' तक पहुँच सकते हैं। <br>",_last_:"_last_"};i18n.eltos.cfg.hi={General:"सामान्य","Idiom for help, examples, etc.":"मदद, उदाहरण आदि के लिए मुहावरा","Notification speed: time before disapear":"अधिसूचना गति: गायब होने से पहले का समय",Editor:"संपादक","Editor theme: light or dark":"संपादक विषय: प्रकाश या अंधेरा",Light:"रोशनी",Dark:"अंधेरा","Editor mode: vim, emacs, etc.":"संपादक मोड: vim, emacs, आदि।",Execution:"क्रियान्वयन","Running speed: execution speed":"दौड़ने की गति: निष्पादन की गति",Slow:"धीरे",Normal:"साधारण",Fast:"उपवास","Step-by-step: element in run mode":"चरण-दर-चरण: रन मोड में तत्व",Instructions:"अनुदेश",Instruction:"अनुदेश","&#181;instructions":"μinstructions",microInstruction:"μInstruction","Breakpoint icon: icon to be used for breakpoints":"ब्रेकप्वाइंट आइकन: ब्रेकप्वाइंट के लिए उपयोग किया जाने वाला आइकन","Limit instructions: number of instructions to be executed":"सीमा निर्देश: निष्पादित किए जाने वाले निर्देशों की संख्या","Limit instruction ticks: to limit clock ticks":"सीमा निर्देश टिक: घड़ी टिक प्रति निर्देश सीमा","Register file":"फ़ाइल रजिस्टर करें","Display format":"प्रारूप को प्रदर्शित करें","Register file names":"फ़ाइल नाम पंजीकृत करें",Numbers:"नंबर",Labels:"लेबल","Editable registers: edit register file values":"संपादन योग्य रजिस्टर: रजिस्टर फ़ाइल मूल्यों को संपादित करें","Circuitry simulation":"सर्किटरी सिमुलेशन","Data-path color":"डेटा-पथ का रंग","Signal color":"संकेत का रंग","Show by value or by activation":"मूल्य या सक्रियण द्वारा दिखाएं",Value:"मूल्य",Activation:"सक्रियण","Interactive mode: signal value can be updated":"इंटरएक्टिव मोड: सिग्नल वैल्यू को अपडेट किया जा सकता है","Quick interactive mode: quick update of signal value":"क्विक इंटरैक्टिव मोड: सिग्नल वैल्यू का त्वरित अपडेट","(example)":"(उदाहरण)",Accesibility:"सरल उपयोग","Active voice: external voice control":"सक्रिय आवाज: बाहरी आवाज नियंत्रण","Verbalization: textual or mathematical":"शब्दश: पाठ या गणितीय","WepSIM User Interface views":"WepSIM उपयोगकर्ता इंटरफ़ेस दृश्य",_last_:"_last_"};i18n.eltos.help.hi={"Welcome tutorial":"आपका स्वागत है ट्यूटोरियल",help_01_01:"स्वागत ट्यूटोरियल खोलें","Simple usage tutorial":"सरल उपयोग ट्यूटोरियल",help_01_02:"माइक्रोप्रोग्रामिंग और असेंबली प्रोग्रामिंग के लिए सरल उपयोग ट्यूटोरियल खोलें","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"सिम्युलेटर: फर्मवेयर",help_02_01:"फर्मवेयर को नियंत्रण मेमोरी में लोड करने के लिए कैसे काम करें","Microcode format":"माइक्रोकोड प्रारूप",help_02_02:"उपयोग किए गए माइक्रोकोड का सिंटैक्स","Simulator: assembly":"सिम्युलेटर: विधानसभा",help_02_03:"विधानसभा के साथ कैसे काम करें जो उपर्युक्त फर्मवेयर का उपयोग करते हैं","Assembly format":"विधानसभा प्रारूप",help_02_04:"विधानसभा तत्वों का सिंटैक्स","Simulator: execution":"सिम्युलेटर: निष्पादन",help_02_05:"सिम्युलेटर विधानसभा और फर्मवेयर को कैसे निष्पादित कर सकता है","Simulated architecture":"नकली वास्तुकला",help_03_01:"नकली प्रोसेसर वास्तुकला का वर्णन","Simulated signals":"नकली संकेत",help_03_02:"मुख्य संकेत नकली तत्व प्रोसेसर का सारांश","Hardware summary":"हार्डवेयर सारांश",help_03_03:"सिम्युलेटेड एलिमेंटल प्रोसेसर हार्डवेयर के लिए संदर्भ कार्ड","License, platforms, etc.":"लाइसेंस, प्लेटफॉर्म, आदि।",help_04_01:"WepSIM लाइसेंस, समर्थित प्लेटफार्मों, प्रौद्योगिकियों का इस्तेमाल किया",Authors:"लेखक",help_04_02:"WepSIM के लेखक",_last_:"_last_"};i18n.eltos.states.hi={States:"राज्य अमेरिका",Current:"वर्तमान","Current State":"वर्तमान स्थिति",History:"इतिहास",None:"कोई नहीं","Empty history":"खाली इतिहास","Empty (only modified values are shown)":"खाली (केवल संशोधित मान दिखाए गए हैं)",Differences:"मतभेद","differences with clipboard state":"क्लिपबोर्ड स्थिति के साथ अंतर","Meets the specified requirements":"निर्दिष्ट आवश्यकताओं को पूरा करता है",history:"इतिहास",Add:"जोड़ना","'Current State' to History":"इतिहास को 'वर्तमान स्थिति'",Check:"चेक",Copy:"प्रतिलिपि","to clipboard":"क्लिपबोर्ड पर",Checkpoint:"जांच की चौकी","File name":"फ़ाइल का नाम","Tag for checkpoint":"चौकी के लिए टैग","File to be loaded":"फ़ाइल लोड की जानी है","Save to File":"फाइल में बचाएं","State(s) to checkpoint":"चौकी के लिए राज्य (एस)","Record to checkpoint":"चौकी पर रिकॉर्ड","Browser cache":"ब्राउज़र कैश","Session to be restore":"सत्र बहाल होने के लिए",_last_:"_last_"};i18n.eltos.examples.hi={"addv + seqv.":"addv + seqv","Alloc.s":"Alloc.s","Dummy instruction":"डमी निर्देश",Exception:"अपवाद",Instructions:"अनुदेश",Interruptions:"व्यवधान","Int. + syscall + except.":"इंट। + syscall + को छोड़कर।","I/O":"एच / ओ",Looping:"लूपिंग","madd, mmul, mxch":"मदद, मंउल, मष्च","Masks & shift":"मास्क और बदलाव",Matrix:"मैट्रिक्स","Memory access":"मेमोरी एक्सेस","SC 1, 4-5, 8, 11-12":"एससी 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + Skipasciicode_2",Subrutine:"सबरूटीन","syscall 1, 4-5, 8, 11-12":"syscall 1, 4-5, 8, 11-12","System call":"सिस्टम कॉल",Threads:"धागे",Vector:"वेक्टर","Compiler Explorer":"Compiler Explorer",example_04_01:"रुकावट, सिस्टम कॉल और अपवाद के साथ उन्नत उदाहरण।",example_05_01:"एप्लिकेशन-विशिष्ट एक्सटेंशन: addv + seqv।",example_05_03:"एप्लिकेशन-विशिष्ट एक्सटेंशन: मैड + mmul + mxch।",example_05_02:"एप्लिकेशन-विशिष्ट एक्सटेंशन: strlen_2 + Skipasciicode_2।",example_03_01:"अस्थायी बिंदु अपवाद के साथ <b> शिक्षाप्रद </ b> उदाहरण।",example_03_02:"<b> शिक्षाप्रद </ b> रुकावट के समर्थन के साथ उदाहरण: लाने के लिए, RETI, और .ktext / -kdata।",example_03_03:"सिस्टम कॉल समर्थन के साथ <b> शिक्षाप्रद </ b> उदाहरण।",example_04_04:"मल्लोक + मुक्त का उदाहरण।",example_04_02:"पूर्णांक और स्ट्रिंग को मुद्रण / पढ़ने के लिए syscall का उदाहरण।",example_04_03:"धागे का उदाहरण।",example_03_01b:"अस्थायी बिंदु अपवाद के साथ उदाहरण।",example_03_02b:"रुकावट के समर्थन के साथ उदाहरण: लाने, RETI, और .ktext / .kdata।",example_02_01:"उदाहरण के साथ क्रमादेशित I / O पहुंच और मूलभूत .text / .data खंड",example_03_03b:"सिस्टम कॉल समर्थन के साथ उदाहरण।",example_02_02:"अधिक निर्देशों और I / O (कीबोर्ड, डिस्प्ले) के साथ विस्तारित उदाहरण।",example_02_04:"सबरूटीन और मैट्रिक्स के साथ विस्तारित उदाहरण।",example_02_03:"मास्क, शिफ्ट और बेसिक .text / .data सेगमेंट के साथ अधिक विस्तारित उदाहरण।",example_01_01:"लाने के साथ सरल उदाहरण, अंकगणितीय निर्देश और मूल .text खंड।",example_01_04:"भ्रूण, शाखा और मूल .text / .data खंड के साथ सरल उदाहरण।",example_01_03:"भ्रूण, शाखा, और मूल .text खंड के साथ सरल उदाहरण।",example_01_02:"फ़ेच, मेमोरी एक्सेस और बेसिक .text / .data खंड के साथ सरल उदाहरण",example_06_01:"उदाहरण का परीक्षण करें।",example_06_02:"सरल संकलक एक्सप्लोरर उदाहरण.",Advanced:"उन्नत",Initial:"प्रारंभिक",Intermediate:"मध्यम",Laboratory:"प्रयोगशाला","Operating Systems":"ऑपरेटिंग सिस्टम",Special:"विशेष","Load example":"लोड उदाहरण","Load Assembly only":"केवल विधानसभा लोड करें","Load Firmware only":"केवल फर्मवेयर लोड करें","Copy reference to clipboard":"क्लिपबोर्ड पर कॉपी संदर्भ",Share:"शेयर","No examples available...":"चयनित हार्डवेयर के लिए कोई उदाहरण उपलब्ध नहीं हैं","Simple example":"सरल उदाहरण है।",_last_:"_last_"};i18n.eltos.dialogs.hi={"Show/Hide ActionBar":"दिखाएँ / छिपाएँ ActionBar","Show/Hide Slider":"स्लाइडर दिखाएँ / छिपाएँ","WepSIM User Interface skin":"WepSIM यूजर इंटरफेस स्किन","Initial intro":"प्रारंभिक परिचय","About WepSIM":"WepSIM के बारे में",Title:"शीर्षक",Message:"संदेश",Duration:"अवधि","Confirm remove record...":"क्या आप वास्तविक रिकॉर्ड निकालना चाहते हैं?","Close or Reset...":"कृपया इसे रखने के लिए Close पर क्लिक करें, <br> या इसे हटाने के लिए रीसेट बटन पर क्लिक करें।","Sure Control Memory...":"क्या आप चाहते हैं कि मैं संपादक नियंत्रण सामग्री के बजाय वर्तमान नियंत्रण मेमोरी सामग्री को बचाऊं।","Show/Hide labels":"लेबल दिखाएं / छिपाएँ","Show/Hide content":"सामग्री दिखाएं / छिपाएँ","Show/Hide assembly":"दिखाएँ / छिपाएँ विधानसभा","Show/Hide pseudo-instructions":"छद्म निर्देश दिखाएं / छिपाएं",Close:"बंद करे",_last_:"_last_"};i18n.eltos.gui.zh_cn={"Loading WepSIM...":"正在加载WepSIM ...",Configuration:"组态",MicroCode:"微码",Assembly:"部件",Simulator:"模拟器",Examples:"例子",Load:"加载",Save:"保存","Load/Save":"加载/保存",Restore:"恢复",Help:"救命",Notifications:"通知",RecordBar:"记录栏",Input:"輸入",Output:"產量","Help Index":"帮助索引",Processor:"处理器","Assembly Debugger":"汇编调试器",Reset:"重启",microInstruction:"μ指令",Instruction:"指令",Run:"跑","Hardware Summary":"硬件摘要",processor:"处理器",details:"细节",microcode:"微码",Signals:"信号",Behaviors:"行为",States:"状态","Control States":"控制国",Dependencies:"依赖",Close:"关",Description:"描述",Show:"节目","Show Main Memory":"显示主内存",compile:"编",Compile:"编","Please write the file name":"请写下文件名","Load from this File":"从此文件加载",labels:"标签",addr:"地址",ess:"ESS",content:"内容",assembly:"部件",instructions:"说明","simulator intro 1":"您可以选择要使用的硬件。默认的是EP（元素处理器）硬件。<br>您可以使用<span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">模式选择器</span>更改使用的硬件。","simulator intro 2":"然后你需要加载微代码（定义指令集）和汇编代码。”你可以使用<span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'>示例</span>，<span class='text-primary bg-light' onclick='wsweb_select_action(\"checkpoint\");'>从文件加载它</span>，或者您可以编辑<span class='text-primary bg-light' onclick='wsweb_change_workspace_microcode();'>新的微码</span>和<span class='text-primary bg-light' onclick='wsweb_change_workspace_assembly();'>新的汇编代码</span>。","simulator intro 3":"最后，在模拟器中，您可以执行微码加上之前加载的程序集。<br>您可以在微指令级别或汇编指令级别执行它。","Prev.":"上一页。",Next:"下一个",End:"结束","Disable tutorial mode":"禁用教程模式",Comment:"评论",Pause:"暂停",Play:"玩",Stop:"停止",Record:"记录",Registers:"寄存器","Control Memory":"控制记忆",Stats:"统计信息",Memory:"记忆","Keyboard+Display":"键盘+显示","I/O Stats":"I/O 统计","I/O Configuration":"I/O 配置",Recent:"最近",Refresh:"刷新",Welcome:"欢迎","Microcode & Assembly":"WepSIM硬件","Pick firm/soft":"從中挑選固件/軟件",Information:"來自的信息",Native:"本機","MIPS32-like":"類似於MIPS32的代碼",RISCV32:"RISCV32代碼","Z80-like":"類似於Z80的代碼",_last_:"_last_"};i18n.eltos.tutorial_welcome.zh_cn={title_0:"欢迎来到WepSIM模拟器！",message_0:"<center> <img alt ='wepsim screenshot'src ='images/simulator/simulator012.jpg'style ='max-width：100％; max-height：40vh;'> </center> <p> <h5>这个简短的教程将向您展示如何：<ol> <li> <a href ='＃'onclick ='sim_tutorial_goframe（“welcome” ，0,1）;'>加载示例。</a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,2);'>执行示例。 </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,3);'>配置模拟。</a> </li> <li> <a href ='＃'onclick ='sim_tutorial_goframe（“welcome”，0,4）;'>获取帮助。</a> </li> </ol> </h5>",title_1:"如何加载一些例子。",message_1:"<center> <img alt ='wepsim screenshot'src ='images/welcome/example_usage.gif'style ='max-width：100％; max-height：60vh'> </center> <p> <h5>单击“示例”按钮，然后单击示例“标题”名称。<br>然后加载微代码和汇编的示例并进行微编译编译。搜索结果</H5>",title_2:"如何执行一个例子。",message_2:"<center> <img alt ='wepsim screenshot'src ='images/welcome/simulation_xinstruction.gif'style ='max-width：100％; max-height：60vh'> </center> <p> <h5>单击下一条指令/微指令，逐步执行。 <br>单击运行按钮执行，直到第一个断点或汇编程序结束。<br> </h5>",title_3:"如何配置WepSIM。",message_3:"<center> <img alt ='wepsim screenshot'src ='images/welcome/config_usage.gif'style ='max-width：100％; max-height：60vh'> </center> <p> <h5>点击“配置”按钮，用户可以自定义WepSIM的不同部分。<br> </h5>",title_4:"如何获得基本帮助。",message_4:"<center> <img alt ='wepsim screenshot'src ='images/welcome/help_usage.gif'style ='max-width：100％; max-height：60vh'> </center> <p> <h5>请点击绿色的“帮助”按钮进入帮助对话框。<br>您可以切换成语（西班牙语/英语），转到帮助索引，或关闭帮助对话框。<br> </h5>",title_5:"欢迎来到WepSIM！",message_5:"<center> <img alt ='wepsim screenshot'src ='images/welcome/help_usage.gif'style ='max-width：100％; max-height：60vh'> </center> <p> <h5>请浏览帮助部分以获取更多信息。 <br>如果单击本教程的结束按钮，WepSIM将为您加载第一个示例。享受！点击</H5>",_last_:"_last_"};i18n.eltos.tutorial_simpleusage.zh_cn={title_0:"简单的WepSIM经验：微程序设计和编程",message_0:"<center> <img alt ='wepsim screenshot'src ='images/simulator/simulator011.jpg'style ='max-width：100％; max-height：40vh;'> </center> <p> <h5>这个简短的教程将向您展示如何：<ol> <li> <a href ='＃'onclick ='sim_tutorial_goframe（“simpleusage” ，0,1）;'>编辑你的微码。</a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'>编辑你的程序集（基于以前的微码）。</a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,5);'>在模拟中执行程序集+微代码。 </A> </LI> </OL> </H5>",title_1:"简单的WepSIM经验：微程序设计和编程",message_1:"<center> <img alt ='wepsim screenshot'src ='images/simulator/firmware001.jpg'style ='max-width：100％; max-height：40vh;'> </center> <p> <h5>第一步是对要使用的固件进行微程序设计。请使用“微码”按钮切换到微码屏幕。</h5>",title_2:"简单的WepSIM经验：微程序设计和编程",message_2:"<center> <img alt ='wepsim screenshot'src ='images/simulator/firmware002.jpg'style ='max-width：100％; max-height：40vh;'> </center> <p> <h5>微程序设计屏幕提供：<ul> <li>微代码编辑器。</li> <li>微编译器。</li> < li>硬件摘要和帮助。</li> </ul>一旦代码准备就绪（编译没有错误），下一步就是进入装配屏幕。</h5>",title_3:"简单的WepSIM经验：微程序设计和编程",message_3:"<center> <img alt ='wepsim screenshot'src ='images/simulator/assembly002b.jpg'style ='max-width：100％; max-height：40vh;'> </center> <p> <h5>第二步是编程要执行的程序集。请使用模拟器屏幕或微代码屏幕上的“组装”按钮。</h5>",title_4:"简单的WepSIM经验：微程序设计和编程",message_4:"<center> <img alt ='wepsim screenshot'src ='images/simulator/assembly003.jpg'style ='max-width：100％; max-height：40vh;'> </center> <p> <h5>编程屏幕提供：<ul> <li>汇编代码的编辑器。</li> <li>汇编编译器。</li > <li>内存映射查看器和帮助。</li> </ul>一旦准备好的代码准备就绪（编辑和编译没有错误），下一步就是进入模拟屏幕。</h5>",title_5:"简单的WepSIM经验：微程序设计和编程",message_5:"<center> <img alt ='wepsim screenshot'src ='images/simulator/simulator010.jpg'style ='max-width：100％; max-height：40vh;'> </center> <p> <h5>第三步是在模拟器中执行汇编代码。<br>模拟器屏幕提供：<ul> <li>汇编和硬件视图。</li> <li>寄存器，控制存储器，主存储器等的详细视图。</li> <li>重置，一步一步或运行直到断点/结束动作。</li> </ul >本教程介绍了WepSIM对学生和教师的典型用法。享受WepSIM！</h5>",_last_:"_last_"};i18n.eltos.tour_intro.zh_cn={step1:"WepSIM有助于更好地理解计算机的工作原理：它是视觉的，交互式的，从信号到中断，系统调用，异常等集成。<br> <br>我们真的相信WepSIM是一种革命性的教学工具。本简短介绍介绍了其界面的关键要素。",step2:"右上角的此按鈕是快速訪問不同'工作模式'的菜單。<br>"+"<br>"+"用戶可以選擇："+"<ul>"+"<li>要使用的硬件（例如，EP處理器等）</li>"+"<li>僅彙編模式，具有整數MIPS <sub>32</sub>或RISC-V<sub>32</sub>指令</li>"+"<li>教程模式，建議在一開始;-）</li>"+"</ul>",step3:"在右上角，“帮助”按钮打开关联的对话框。<br> <br>帮助对话框总结了教程，说明，信息等。",step4:"在左侧，“示例”按钮打开示例对话框。<br> <br>有许多示例可用于逐步学习。",step5:"在左上角，“配置”按钮打开配置对话框。<br> <br>它允许用户适应执行，用户界面，首选项等的几个方面。",step6:"恭喜！您知道WepSIM界面中的关键元素。<br>在“帮助”对话框中，您可以访问“欢迎教程”以继续学习。<br>",_last_:"_last_"};i18n.eltos.cfg.zh_cn={General:"一般","Idiom for help, examples, etc.":"成语的帮助，例子等","Notification speed: time before disapear":"通知速度：消失之前的时间",Editor:"编辑","Editor theme: light or dark":"编辑主题：光明或黑暗",Light:"光",Dark:"暗","Editor mode: vim, emacs, etc.":"编辑模式：vim，emacs等",Execution:"执行","Running speed: execution speed":"运行速度：执行速度",Slow:"慢",Normal:"正常",Fast:"快速","Step-by-step: element in run mode":"循序渐进：运行模式中的元素",Instructions:"说明",Instruction:"指令","&#181;instructions":"μinstructions",microInstruction:"μInstruction","Breakpoint icon: icon to be used for breakpoints":"断点图标：用于断点的图标","Limit instructions: number of instructions to be executed":"限制指令：要执行的指令数","Limit instruction ticks: to limit clock ticks":"限制指令标记：每条指令的时钟标记限制","Register file":"注册文件","Display format":"显示格式","Register file names":"注册文件名",Numbers:"数字",Labels:"标签","Editable registers: edit register file values":"可编辑寄存器：编辑寄存器文件值","Circuitry simulation":"电路仿真","Data-path color":"数据路径颜色","Signal color":"信号颜色","Show by value or by activation":"按价值或激活显示",Value:"值",Activation:"激活","Interactive mode: signal value can be updated":"交互模式：可以更新信号值","Quick interactive mode: quick update of signal value":"快速交互模式：快速更新信号值","(example)":"（例）",Accesibility:"无障碍","Active voice: external voice control":"主动语音：外部语音控制","Verbalization: textual or mathematical":"语言化：文本或数学","WepSIM User Interface views":"WepSIM用户界面视图",_last_:"_last_"};i18n.eltos.help.zh_cn={"Welcome tutorial":"欢迎教程",help_01_01:"打开欢迎教程","Simple usage tutorial":"简单的使用教程",help_01_02:"打开简单的使用教程，进行微程序设计和汇编编程","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"模拟器：固件",help_02_01:"如何使用要加载到控制存储器中的固件","Microcode format":"微码格式",help_02_02:"使用的微码的语法","Simulator: assembly":"模拟器：组装",help_02_03:"如何使用使用上述固件的程序集","Assembly format":"装配格式",help_02_04:"装配元素的语法","Simulator: execution":"模拟器：执行",help_02_05:"模拟器如何执行组件和固件","Simulated architecture":"模拟的架构",help_03_01:"模拟处理器体系结构的描述","Simulated signals":"模拟信号",help_03_02:"模拟元素处理器的主要信号摘要","Hardware summary":"硬件摘要",help_03_03:"模拟元素处理器硬件的参考卡","License, platforms, etc.":"许可证，平台等",help_04_01:"WepSIM许可证，支持的平台，使用的技术",Authors:"作者",help_04_02:"WepSIM的作者",_last_:"_last_"};i18n.eltos.states.zh_cn={States:"状态",Current:"当前","Current State":"当前状态",History:"历史",None:"没有","Empty history":"空的历史","Empty (only modified values are shown)":"空（仅显示修改后的值）",Differences:"差异","differences with clipboard state":"与剪贴板状态的差异","Meets the specified requirements":"符合指定的要求",history:"历史",Add:"加","'Current State' to History":"历史的“现状”",Check:"校验",Copy:"复制","to clipboard":"到剪贴板",Checkpoint:"检查站","File name":"文件名","Tag for checkpoint":"检查点的标记","File to be loaded":"要加载的文件","Save to File":"保存到文件","State(s) to checkpoint":"国家到检查站","Record to checkpoint":"记录到检查点","Browser cache":"瀏覽器緩存","Session to be restore":"會話要還原",_last_:"_last_"};i18n.eltos.examples.zh_cn={"addv + seqv.":"addv + seqv。","Alloc.s":"Alloc.s","Dummy instruction":"虚拟指令",Exception:"例外",Instructions:"说明",Interruptions:"中断","Int. + syscall + except.":"诠释。 +系统调用+除外。","I/O":"H/O.",Looping:"循环","madd, mmul, mxch":"帮助，心情，头脑","Masks & shift":"面具和转变",Matrix:"矩阵","Memory access":"内存访问","SC 1, 4-5, 8, 11-12":"SC 1,4-5,5,11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"子程序","syscall 1, 4-5, 8, 11-12":"系统调用1,4,5,18,11-12","System call":"系统调用",Threads:"主题",Vector:"向量","Compiler Explorer":"Compiler Explorer",example_04_01:"具有中断，系统调用和异常的高级示例。",example_05_01:"特定于应用程序的扩展：addv + seqv。",example_05_03:"特定于应用程序的扩展：madd + mmul + mxch。",example_05_02:"特定于应用程序的扩展：strlen_2 + skipasciicode_2。",example_03_01:"带有浮点异常的<b>有教育的</ b>示例。",example_03_02:"支持中断的<b>有教育的</ b>示例：fetch，RETI和.ktext/.kdata。",example_03_03:"<b>具有系统调用支持的教学</ b>示例。",example_04_04:"malloc + free的例子。",example_04_02:"用于打印/读取整数和字符串的系统调用示例。",example_04_03:"线程示例。",example_03_01b:"浮点异常的示例。",example_03_02b:"支持中断的示例：fetch，RETI和.ktext/.kdata。",example_02_01:"编程I/O访问和基本.text/.data段的示例。",example_03_03b:"系统调用支持示例。",example_02_02:"带有更多指令和I/O（键盘，显示屏）的扩展示例。",example_02_04:"使用subrutine和matrix的扩展示例。",example_02_03:"使用mask，shift和basic .text/.data段的更多扩展示例。",example_01_01:"使用fetch，算术指令和基本.text段的简单示例。",example_01_04:"fetch，branch和basic .text/.data段的简单示例。",example_01_03:"fetch，branch和basic .text段的简单示例。",example_01_02:"获取，内存访问和基本.text/.data段的简单示例。",example_06_01:"测试示例。",example_06_02:"Simple Compiler Explorer示例.",Advanced:"高级",Initial:"初始",Intermediate:"中间",Laboratory:"实验室","Operating Systems":"操作系统",Special:"特别","Load example":"加載示例","Load Assembly only":"仅装载装配","Load Firmware only":"仅加载固件","Copy reference to clipboard":"复制对剪贴板的引用",Share:"分享","No examples available...":"没有可用于所选硬件的示例","Simple example":"简单的例子。",_last_:"_last_"};i18n.eltos.dialogs.zh_cn={"Show/Hide ActionBar":"显示/隐藏ActionBar","Show/Hide Slider":"显示/隐藏滑块","WepSIM User Interface skin":"WepSIM用户界面皮肤","Initial intro":"最初的介绍","About WepSIM":"关于WepSIM",Title:"标题",Message:"信息",Duration:"持续时间","Confirm remove record...":"你想删除实际记录吗？","Close or Reset...":"请单击“关闭”以保留它，或单击“重置”按钮将其删除。","Sure Control Memory...":"你想让我保存当前的控制存储器内容而不是编辑器内容吗？","Show/Hide labels":"显示/隐藏标签","Show/Hide content":"显示/隐藏内容","Show/Hide assembly":"显示/隐藏程序集","Show/Hide pseudo-instructions":"显示/隐藏伪指令",Close:"关",_last_:"_last_"};i18n.eltos.gui.ru={"Loading WepSIM...":"Загрузка WepSIM ...",Configuration:"конфигурация",MicroCode:"микрокода",Assembly:"сборочный",Simulator:"имитатор",Examples:"Примеры",Load:"нагрузка",Save:"Сохранить","Load/Save":"нагрузка/Сохранить",Restore:"Восстановить",Help:"Помогите",Notifications:"Yведомления",RecordBar:"Запись бар",Input:"вход",Output:"Выход","Help Index":"Индекс справки",Processor:"процессор","Assembly Debugger":"Сборочный отладчик",Reset:"Сброс",microInstruction:"μинструкция",Instruction:"инструкция",Run:"Бежать","Hardware Summary":"Краткое описание оборудования",processor:"процессор",details:"подробности",microcode:"микрокода",Signals:"сигналы",Behaviors:"поведения",States:"состояния","Control States":"Контрольные состояния",Dependencies:"зависимости",Close:"близко",Description:"Описание",Show:"Шоу","Show Main Memory":"Показать основную память",compile:"компилировать",Compile:"компилировать","Please write the file name":"Пожалуйста, напишите имя файла","Load from this File":"Загрузить из этого файла",labels:"этикетки",addr:"адр",ess:"ESS",content:"содержание",assembly:"сборка",instructions:"инструкции","simulator intro 1":"Вы можете выбрать оборудование, которое будет использоваться. По умолчанию используется оборудование EP (Elemental Processor). <br> Вы можете использовать <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">селектор режима</span> для изменения используемого оборудования.","simulator intro 2":"Затем вам нужно загрузить микрокод (определяет набор инструкций) и код сборки. <br> Вы можете использовать <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'>пример</span>, <span class='text-primary bg-light' onclick='wsweb_select_action(\"checkpoint\");'> загрузить его из файла </span>, или вы можете редактировать <span class='text-primary bg-light' onclick='wsweb_change_workspace_microcode();'>новый микрокод</span> и <span class='text-primary bg-light' onclick='wsweb_change_workspace_assembly();'>новый код сборки</ span>. ","simulator intro 3":"Наконец, в симуляторе вы можете выполнить микрокод плюс сборку, загруженную ранее. <br> Вы можете выполнить его как на уровне микрокоманды, так и на уровне инструкции сборки.","Prev.":"Пред.",Next:"следующий",End:"Конец","Disable tutorial mode":"Отключить учебный режим",Comment:"Комментарий",Pause:"Пауза",Play:"Играть",Stop:"Стоп",Record:"запись",Registers:"Регистры","Control Memory":"Управляющая память",Stats:"Статистика",Memory:"Память","Keyboard+Display":"Клавиатура+Дисплей","I/O Stats":"Статистика ввода/вывода","I/O Configuration":"Конфигурация входа/выхода",Recent:"последний",Refresh:"обновление",Welcome:"желанный","Microcode & Assembly":"Оборудование WepSIM","Pick firm/soft":"Выберите прошивку / программное обеспечение от",Information:"Информация от",Native:"Родные","MIPS32-like":"MIPS32-подобный код",RISCV32:"Код RISCV32","Z80-like":"Z80-подобный код",_last_:"_last_"};i18n.eltos.tutorial_welcome.ru={title_0:"Добро пожаловать в симулятор WepSIM!",message_0:"<center> <img alt = 'скриншот wepsim' src = 'images/simulator/simulator012.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Этот краткий учебник покажет, как: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe (\"welcome\" , 0,1); '> Загрузить пример. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,2);'> Выполнить пример. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,3);'> Настройте симуляцию. </a> </li> <li> <a href = '#' onclick = 'sim_tutorial_goframe (\"welcome\", 0,4);'> Получить помощь. </a> </li> </ol> </h5>",title_1:"Как загрузить пример.",message_1:"<center> <img alt = 'скриншот wepsim' src = 'images/welcome/example_usage.gif' style = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Нажмите кнопку «пример», затем щелкните имя примера «title». <br> Затем пример для микрокода и сборки загружается и микрокомпилируется скомпилирован. <br> <br> </h5>",title_2:"Как выполнить пример.",message_2:"<center> <img alt = 'скриншот wepsim' src = 'images/welcome/Simulation_xinstruction.gif' style = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Нажмите на следующую инструкцию/микроинструкцию, чтобы выполнить ее шаг за шагом. <br> Нажмите кнопку запуска, чтобы выполнить до первой точки останова или до конца программы сборки. <br> </h5>",title_3:"Как настроить WepSIM.",message_3:"<center> <img alt = 'скриншот wepsim' src = 'images/welcome/config_usage.gif' style = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Нажмите кнопку «Настройка», и пользователи смогут настраивать различные части WepSIM. <br> </h5>",title_4:"Как получить основную помощь.",message_4:"<center> <img alt = 'скриншот wepsim' src = 'images/welcome/help_usage.gif' style = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Пожалуйста, нажмите зеленую кнопку «Помощь», чтобы открыть диалоговое окно справки. <br> Вы можете переключить идиому (испанский/английский), перейдите к Индекс справки или закройте диалог справки. <br> </h5>",title_5:"Добро пожаловать в WepSIM!",message_5:"<center> <img alt = 'скриншот wepsim' src = 'images/welcome/help_usage.gif' style = 'max-width: 100%; max-height: 60vh '> </center> <p> <h5> Пожалуйста, просмотрите разделы справки для получения дополнительной информации. <br> Если вы нажмете кнопку окончания этого урока, WepSIM загрузит первый пример для вас. Наслаждайтесь! <br> </h5>",_last_:"_last_"};i18n.eltos.tutorial_simpleusage.ru={title_0:"Простой опыт WepSIM: микропрограммирование и программирование",message_0:"<center> <img alt = 'скриншот wepsim' src = 'images/simulator/simulator011.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Этот краткий учебник покажет вам, как: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe (\"simpleusage\" , 0,1); '> Редактируйте свой микрокод. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'> Редактируйте свою сборку ( на основе предыдущего микрокода). </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,5);'> Выполните сборку + микрокод в симуляции. </a> </литий> </ол> </h5>",title_1:"Простой опыт WepSIM: микропрограммирование и программирование",message_1:"<center> <img alt = 'скриншот wepsim' src = 'images/simulator/firmware001.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Первым шагом является микропрограммирование микропрограммы, которая будет использоваться. Пожалуйста, используйте кнопку «Микрокод» для переключения на экран микрокода. </H5>",title_2:"Простой опыт WepSIM: микропрограммирование и программирование",message_2:"<center> <img alt = 'скриншот wepsim' src = 'images/simulator/firmware002.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Экран микропрограммирования: <ul> <li> Редактор микрокода. </li> <li> Микрокомпилятор. </li> < li> Краткое описание оборудования и справка. </li> </ul> Как только ваш код будет готов (скомпилирован без ошибок), следующий шаг - перейти на экран сборки. </h5>",title_3:"Простой опыт WepSIM: микропрограммирование и программирование",message_3:"<center> <img alt = 'скриншот wepsim' src = 'images/simulator/assembly002b.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Второй шаг - это программирование сборки, которая будет выполнена. Используйте кнопку «Сборка» на экране симулятора или на экране микрокода. </H5>",title_4:"Простой опыт WepSIM: микропрограммирование и программирование",message_4:"<center> <img alt = 'скриншот wepsim' src = 'images/simulator/assembly003.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Экран программирования содержит: <ul> <li> Редактор кода сборки. </li> <li> Компилятор сборки. </li > <li> Средство просмотра карты памяти и справка. </li> </ul> Как только ваш сборочный код будет готов (отредактирован и скомпилирован без ошибок), следующий шаг - перейти на экран симуляции. </h5>",title_5:"Простой опыт WepSIM: микропрограммирование и программирование",message_5:"<center> <img alt = 'скриншот wepsim' src = 'images/simulator/simulator010.jpg' style = 'max-width: 100%; max-height: 40vh; '> </center> <p> <h5> Третий шаг - выполнение кода сборки в симуляторе. <br> На экране симулятора отображается: <ul> <li> Представление сборки и оборудования . </li> <li> Подробный вид регистров, управляющей памяти, основной памяти и т. д. </li> <li> Сброс, шаг за шагом или выполнение до точки останова/действия по завершению. </li> </ul > В этом руководстве было представлено типичное использование WepSIM для студентов и преподавателей. Наслаждайтесь WepSIM! </H5>",_last_:"_last_"};i18n.eltos.tour_intro.ru={step1:"WepSIM помогает лучше понять, как работает компьютер: он визуален, интерактивен, интегрируется от сигналов до прерываний, системных вызовов, исключений и т. Д. <br> <br> Мы действительно верим, что WepSIM - революционный инструмент обучения. Этот краткий тур знакомит с ключевыми элементами его интерфейса.",step2:"Эта кнопка в правом верхнем углу представляет собой меню быстрого доступа к различным 'режимам работы'.<br>"+"<br>"+"Пользователи могут выбрать:"+"<ul>"+"<li>Оборудование для работы (например, процессор EP и т. д.) </li>"+"<li>Режим только сборки, с целочисленными инструкциями MIPS<sub>32</sub> или RISC-V<sub>32</sub> </li>"+"<li>Режим обучения, рекомендуется в начале; -) </li>"+"</ul>",step3:"В правом верхнем углу кнопка «Справка» открывает связанный диалог. <br> <br> Диалог справки суммирует учебные пособия, описания, информацию и т. Д.",step4:"А слева кнопка «примеры» открывает диалоговое окно примеров. <br> <br> Существует множество примеров, которые можно использовать для постепенного изучения.",step5:"В левом верхнем углу кнопка «конфигурация» открывает диалоговое окно конфигурации. <br> <br> Она позволяет пользователям адаптировать несколько аспектов выполнения, пользовательский интерфейс, настройки и т. Д.",step6:"Congrat! Вы знаете ключевые элементы интерфейса WepSIM. <br> В диалоговом окне «Справка» вы можете получить доступ к «Добро пожаловать», чтобы продолжить обучение.",_last_:"_last_"};i18n.eltos.cfg.ru={General:"генеральный","Idiom for help, examples, etc.":"Идиома за помощь, примеры и т. Д.","Notification speed: time before disapear":"Скорость уведомления: время до исчезновения",Editor:"редактор","Editor theme: light or dark":"Тема редактора: светлая или темная",Light:"Свет",Dark:"Темно","Editor mode: vim, emacs, etc.":"Режим редактора: vim, emacs и т. Д.",Execution:"выполнение","Running speed: execution speed":"Скорость бега: скорость исполнения",Slow:"Медленный",Normal:"Нормальный",Fast:"Быстро","Step-by-step: element in run mode":"Шаг за шагом: элемент в режиме запуска",Instructions:"инструкции",Instruction:"инструкция","&#181;instructions":"μinstructions",microInstruction:"μInstruction","Breakpoint icon: icon to be used for breakpoints":"Значок точки останова: значок, который будет использоваться для точек останова","Limit instructions: number of instructions to be executed":"Ограничение инструкций: количество выполняемых инструкций","Limit instruction ticks: to limit clock ticks":"Ограничение тактов инструкций: ограничение тактов часов на инструкцию","Register file":"Зарегистрировать файл","Display format":"Формат отображения","Register file names":"Зарегистрировать имена файлов",Numbers:"чисел",Labels:"Этикетки","Editable registers: edit register file values":"Редактируемые регистры: редактируйте значения файла регистра","Circuitry simulation":"Схемотехническое моделирование","Data-path color":"Цвет пути данных","Signal color":"Цвет сигнала","Show by value or by activation":"Показать по значению или по активации",Value:"Значение",Activation:"активация","Interactive mode: signal value can be updated":"Интерактивный режим: значение сигнала может быть обновлено","Quick interactive mode: quick update of signal value":"Быстрый интерактивный режим: быстрое обновление значения сигнала","(example)":"(пример)",Accesibility:"доступность","Active voice: external voice control":"Активный голос: внешнее голосовое управление","Verbalization: textual or mathematical":"Вербализация: текстовая или математическая","WepSIM User Interface views":"Пользовательский интерфейс WepSIM",_last_:"_last_"};i18n.eltos.help.ru={"Welcome tutorial":"Добро пожаловать учебник",help_01_01:"Откройте приветственное руководство","Simple usage tutorial":"Простое руководство по использованию",help_01_02:"Откройте простое руководство по использованию для микропрограммирования и программирования сборки","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"Симулятор: прошивка",help_02_01:"Как работать с прошивкой для загрузки в память управления","Microcode format":"Формат микрокода",help_02_02:"Синтаксис используемого микрокода","Simulator: assembly":"Симулятор: сборка",help_02_03:"Как работать со сборкой, использующей вышеупомянутую прошивку","Assembly format":"Формат сборки",help_02_04:"Синтаксис элементов сборки","Simulator: execution":"Симулятор: исполнение",help_02_05:"Как симулятор может выполнить сборку и прошивку","Simulated architecture":"Имитация архитектуры",help_03_01:"Описание моделируемой архитектуры процессора","Simulated signals":"Имитированные сигналы",help_03_02:"Сводка основных сигналов имитируемого элементного процессора","Hardware summary":"Краткое описание оборудования",help_03_03:"Справочная карта для аппаратного обеспечения имитированного элементного процессора","License, platforms, etc.":"Лицензия, платформы и т. Д.",help_04_01:"Лицензия WepSIM, поддерживаемые платформы, используемые технологии",Authors:"Авторы",help_04_02:"Авторы WepSIM",_last_:"_last_"};i18n.eltos.states.ru={States:"состояния",Current:"Текущий","Current State":"Текущее состояние",History:"история",None:"Никто","Empty history":"Пустая история","Empty (only modified values are shown)":"Пусто (отображаются только измененные значения)",Differences:"Различия","differences with clipboard state":"различия с состоянием буфера обмена","Meets the specified requirements":"Соответствует указанным требованиям",history:"история",Add:"добавлять","'Current State' to History":"«Текущее состояние» истории",Check:"Проверьте",Copy:"копия","to clipboard":"в буфер обмена",Checkpoint:"Контрольно-пропускной пункт","File name":"Имя файла","Tag for checkpoint":"Тег для контрольной точки","File to be loaded":"Файл для загрузки","Save to File":"Сохранить в файл","State(s) to checkpoint":"Состояние (я) до контрольной точки","Record to checkpoint":"Запись на контрольно-пропускной пункт","Browser cache":"Кеш браузера","Session to be restore":"Сессия подлежит восстановлению",_last_:"_last_"};i18n.eltos.examples.ru={"addv + seqv.":"addv + seqv.","Alloc.s":"Alloc.s","Dummy instruction":"Пустая инструкция",Exception:"исключение",Instructions:"инструкции",Interruptions:"Перерывы","Int. + syscall + except.":"Int. + системный вызов + кроме","I/O":"I/O",Looping:"перекручивание","madd, mmul, mxch":"Помощь, настроение, разум","Masks & shift":"Маски и смена",Matrix:"матрица","Memory access":"Доступ к памяти","SC 1, 4-5, 8, 11-12":"ПК 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"подпрограмма","syscall 1, 4-5, 8, 11-12":"системный вызов 1, 4-5, 8, 11-12","System call":"Системный вызов",Threads:"Потоки",Vector:"Вектор","Compiler Explorer":"Compiler Explorer",example_04_01:"Расширенный пример с прерыванием, системным вызовом и исключением.",example_05_01:"Расширение для конкретного приложения: addv + seqv.",example_05_03:"Расширение для конкретного приложения: madd + mmul + mxch.",example_05_02:"Расширение для конкретного приложения: strlen_2 + skipasciicode_2.",example_03_01:"<b> Поучительный </b> пример с исключением с плавающей запятой.",example_03_02:"<b> Поучительный </b> пример с поддержкой прерываний: fetch, RETI и .ktext/.kdata.",example_03_03:"<b> Поучительный </b> пример с поддержкой системных вызовов.",example_04_04:"Пример malloc + бесплатный.",example_04_02:"Пример системного вызова для печати/чтения целого числа и строки.",example_04_03:"Пример темы.",example_03_01b:"Пример с исключением с плавающей запятой.",example_03_02b:"Пример с поддержкой прерываний: fetch, RETI и .ktext/.kdata.",example_02_01:"Пример с запрограммированным доступом ввода/вывода и базовым сегментом .text/.data.",example_03_03b:"Пример с поддержкой системных вызовов.",example_02_02:"Расширенный пример с дополнительными инструкциями и вводом/выводом (клавиатура, дисплей).",example_02_04:"Расширенный пример с подпрограммой и матрицей.",example_02_03:"Более расширенный пример с масками, смещением и базовым сегментом .text/.data.",example_01_01:"Простой пример с извлечением, арифметическими инструкциями и базовым сегментом .text.",example_01_04:"Простой пример с fetch, branch и базовым сегментом .text/.data.",example_01_03:"Простой пример с получением, ветвью и основным сегментом .text.",example_01_02:"Простой пример с извлечением, доступом к памяти и базовым сегментом .text/.data.",example_06_01:"Тестовый пример.",example_06_02:"Пример простого компилятора.",Advanced:"продвинутый",Initial:"начальный",Intermediate:"промежуточный",Laboratory:"лаборатория","Operating Systems":"Операционные системы",Special:"Специальный","Load example":"Пример загрузки","Load Assembly only":"Только загрузка","Load Firmware only":"Загрузить только прошивку","Copy reference to clipboard":"Скопировать ссылку в буфер обмена",Share:"Поделиться","No examples available...":"Для выбранного оборудования отсутствуют примеры.","Simple example":"Простой пример",_last_:"_last_"};i18n.eltos.dialogs.ru={"Show/Hide ActionBar":"Показать / Скрыть ActionBar","Show/Hide Slider":"Показать / Скрыть слайдер","WepSIM User Interface skin":"Скин интерфейса пользователя WepSIM","Initial intro":"Начальное вступление","About WepSIM":"О компании WepSIM",Title:"заглавие",Message:"Сообщение",Duration:"продолжительность","Confirm remove record...":"Вы хотите удалить фактическую запись?","Close or Reset...":"Пожалуйста, нажмите Закрыть, чтобы сохранить его, <br> или нажмите кнопку Сброс, чтобы удалить его.","Sure Control Memory...":"Вы хотите, чтобы я сохранил текущее содержимое управляющей памяти, а не содержимое редактора?","Show/Hide labels":"Показать / Скрыть метки","Show/Hide content":"Показать / Скрыть содержимое","Show/Hide assembly":"Показать / Скрыть сборку","Show/Hide pseudo-instructions":"Показать / Скрыть псевдоинструкции",Close:"близко",_last_:"_last_"};i18n.eltos.gui.sv={"Loading WepSIM...":"Laddar WepSIM ...",Configuration:"Konfiguration",MicroCode:"mikrokod",Assembly:"hopsättning",Simulator:"Simulator",Examples:"exempel",Load:"Ladda",Save:"Spara","Load/Save":"Ladda/Spara",Restore:"Återställa",Help:"Hjälp",Notifications:"Notifikationer",RecordBar:"RecordBar",Input:"Inmatning",Output:"Produktion","Help Index":"Hjälpindex",Processor:"processor","Assembly Debugger":"Assembly Debugger",Reset:"Återställa",microInstruction:"μInstruktion",Instruction:"Instruktion",Run:"Springa","Hardware Summary":"Hårdvara Sammanfattning",processor:"processor",details:"detaljer",microcode:"mikrokod",Signals:"signaler",Behaviors:"beteenden",States:"stater","Control States":"Kontrollstater",Dependencies:"beroenden",Close:"Stänga",Description:"Beskrivning",Show:"Show","Show Main Memory":"Visa huvudminne",compile:"sammanställa",Compile:"Sammanställa","Please write the file name":"Vänligen skriv filnamnet","Load from this File":"Ladda från den här filen",labels:"etiketter",addr:"addr",ess:"ess",content:"innehåll",assembly:"hopsättning",instructions:"instruktioner","simulator intro 1":"Du kan välja den hårdvara som ska användas. Standardinställningen är EP (Elemental Processor) hårdvara. <br>"+"Du kan använda <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">lägesväljaren</span> för att ändra maskinvaran som används.","simulator intro 2":"Då måste du ladda mikrokoden (definierar instruktionsuppsättningen) och monteringskoden. <br>"+"Du kan använda <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'>ett exempel</span>,"+"<span class='text-primary bg-light' onclick='wsweb_select_action(\"checkpoint\");'>ladda den från en fil</span>,"+"eller så kan du redigera <span class='text-primary bg-light' onclick='wsweb_change_workspace_microcode();'>en ny mikrokod</span>"+"och <span class='text-primary bg-light' onclick='wsweb_change_workspace_assemble();'>en ny monteringskod</span>.","simulator intro 3":"Slutligen, i simulatorn kan du köra den mikrokod plus enhet som laddats tidigare. <br>"+"Du kan köra det båda, på mikroinstruktionsnivå eller monteringsinstruktionsnivå.","Prev.":"Föregående.",Next:"Nästa",End:"Slutet","Disable tutorial mode":"Inaktivera handledningsläge",Comment:"Kommentar",Pause:"Paus",Play:"Spela",Stop:"Sluta",Record:"Spela in",Registers:"register","Control Memory":"Kontrollminne",Stats:"stats",Memory:"Minne","Keyboard+Display":"Tangentbord + Display","I/O Stats":"I/O Stats","I/O Configuration":"I/O Configuration",Recent:"Nyligen",Refresh:"Uppdatera",Welcome:"Välkommen","Microcode & Assembly":"WepSIM-hårdvara","Pick firm/soft":"Välj fast programvara / programvara från",Information:"Information från",Native:"Inföding","MIPS32-like":"MIPS32-liknande kod",RISCV32:"RISCV32-kod","Z80-like":"Z80-liknande kod",_last_:"_last_"};i18n.eltos.tutorial_welcome.sv={title_0:"Välkommen till WepSIM-simulatorn!",message_0:"<img alt = 'wepsim screenshot' src = 'images/simulator/simulator012.jpg' style = 'max-width: 100%; maxhöjd: 40vh; '> <p> <h5> Denna korta handledning kommer att visa dig hur man: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe , 0,1); '> Ladda ett exempel. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"welcome\",0,2);'> Exekvera ett exempel. </a> </li> <li> <a href='#'onclick='sim_tutorial_goframe(\"welcome\",0,3);'> Konfigurera simuleringen. </a> </li> <li> <a href = '#' onclick = 'sim_tutorial_goframe (\"välkommen\", 0,4);'> Få hjälp. </a> </li> </ol> </h5>",title_1:"Så här laddar du lite exempel.",message_1:"<img alt = 'wepsim screenshot' src = 'images/welcome/example_usage.gif' style = 'max-width: 100%; maxhöjd: 60vh '> <p> <h5> Klicka på \"exempel\" -knappen och klicka sedan på exemplet \"title\" -namn. <br> Då är exemplet för mikrokod och montering laddad och mikrokompilerad och sammanställas. <br> </h5>",title_2:"Hur man utför ett exempel.",message_2:"<img alt = 'wepsim skärmdump' src = 'images/welcome/simulation_xinstruction.gif' style = 'max-width: 100%; maxhöjd: 60vh '> <p> <h5> Klicka på nästa instruktion/mikroinstruktion för att utföra steg för steg. <br> Klicka på körknappen för att exekvera till den första brytpunkten eller slutet av monteringsprogrammet. <br> </h5>",title_3:"Så här konfigurerar du WepSIM.",message_3:"<img alt = 'wepsim skärmdump' src = 'images/welcome/config_usage.gif' style = 'max-width: 100%; maxhöjd: 60vh '> <p> <h5> Klicka på knappen' konfiguration 'och användarna kan anpassa olika delar av WepSIM. <br> </h5>",title_4:"Så här får du grundläggande hjälp.",message_4:"<img alt = 'wepsim skärmdump' src = 'images/welcome/help_usage.gif' style = 'max-width: 100%; maxhöjd: 60vh '> <p> <h5> Vänligen klicka på den gröna hjälpen för att nå hjälpdialogrutan. <br> Du kan byta idiom (spanska/engelska), gå till hjälpindex eller stäng hjälpdialogrutan. <br> </h5>",title_5:"Välkommen till WepSIM!",message_5:"<img alt = 'wepsim skärmdump' src = 'images/welcome/help_usage.gif' style = 'max-width: 100%; maxhöjd: 60vh '> <p> <h5> Vänligen utforska hjälpsektionerna för mer information. <br> Om du klickar på slutet av denna handledning kommer WepSIM att ladda det första exemplet för dig. Njut <br> </h5>",_last_:"_last_"};i18n.eltos.tutorial_simpleusage.sv={title_0:"Enkel WepSIM-upplevelse: mikroprogrammering och programmering",message_0:"<img alt = 'wepsim screenshot' src = 'images/simulator/simulator011.jpg' style = 'max-width: 100%; maxhöjd: 40vh; '> <p> <h5> Denna korta handledning kommer att visa dig hur man: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe (\"simpleusage\" , 0,1); '> Ändra din mikrokod. </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'> Redigera din montering baserat på föregående mikrokod). </a> </li> <li> <a href='#' onclick='sim_tutorial_goframe(\"simpleusage\",0,5) ;'> Utför montering + mikrokod i simuleringen. </a> </li> </ol> </h5>",title_1:"Enkel WepSIM-upplevelse: mikroprogrammering och programmering",message_1:"<img alt = 'wepsim skärmdump' src = 'images/simulator/firmware001.jpg' style = 'max-width: 100%; maxhöjd: 40vh; '> <p> <h5> Det första steget är att mikroprogrammera den fasta programvaran som ska användas. Använd \"Mikrokod\" -knappen för att växla till mikrokodskärmen. </H5>",title_2:"Enkel WepSIM-upplevelse: mikroprogrammering och programmering",message_2:"<img alt = 'wepsim skärmdump' src = 'images/simulator/firmware002.jpg' style = 'max-width: 100%; maxhöjden: 40vh; '> <p> <h5> Mikroprogrammeringsskärmen innehåller: <ul> <li> Redigeraren för mikrokoden. </li> <li> Mikrokompatorn. </li> < li> Hårdvarans sammanfattning och hjälp. </li> </ul> När din kod är klar (kompilerad utan fel), går nästa steg till monteringsskärmen. </h5>",title_3:"Enkel WepSIM-upplevelse: mikroprogrammering och programmering",message_3:"<img alt = 'wepsim skärmdump' src = 'images/simulator/assembly002b.jpg' style = 'max-width: 100%; maxhöjd: 40vh; '> <p> <h5> Det andra steget är att programmera enheten som ska utföras. Använd knappen \"Assembly\" från både simulatorskärmen eller mikrokodskärmen. </H5>",title_4:"Enkel WepSIM-upplevelse: mikroprogrammering och programmering",message_4:"<img alt = 'wepsim skärmdump' src = 'images/simulator/assembly003.jpg' style = 'max-width: 100%; maxhöjd: 40vh; '> <p> <h5> Programmeringsskärmen innehåller: <ul> <li> Redaktören för monteringsnumret. </li> <li> Sammansättningssamlingen. </li > <li> Minneskartvyvisaren och hjälp. </li> </ul> När din tillförlitliga kod är klar (redigerad och kompilerad utan fel) ska nästa steg gå in på simuleringsskärmen. </h5>",title_5:"Enkel WepSIM-upplevelse: mikroprogrammering och programmering",message_5:"<img alt = 'wepsim screenshot' src = 'images/simulator/simulator010.jpg' style = 'max-width: 100%; maxhöjd: 40vh; '> <p> <h5> Det tredje steget är att utföra monteringskoden i simulatorn. <br> Simulatorskärmen innehåller: <ul> <li> Sammansättning och maskinvarovy </li> <li> Detaljerad vy över register, kontrollminne, huvudminne, etc. </li> <li> Återställ, steg för steg eller springa till brytpunkt/slutakt. </li> </ul > Denna handledning har infört den typiska användningen av WepSIM för studenter och lärare. Njut av WepSIM! </H5>",_last_:"_last_"};i18n.eltos.tour_intro.sv={step1:"WepSIM hjälper till att bättre förstå hur en dator fungerar: den är visuell, interaktiv, integreras från signaler upp till avbrott, systemsamtal, undantag, etc. <br> <br> Vi tror verkligen WepSIM är ett revolutionerande undervisningsverktyg. Den här korta rundan introducerar de viktigaste delarna av dess gränssnitt.",step2:"Den här knappen längst upp till höger är en snabbåtkomstmeny för olika arbetslägen. <br>"+"<br>"+"Användare kan välja:"+"<ul>"+"<li>Maskinvaran att arbeta med (t.ex. EP-processor, etc.)</li>"+"<li>Endast monteringsläge, med heltal MIPS<sub>32</sub> eller RISC-V<sub>32</sub> instruktioner</li>"+"<li>Instruktionsläget, rekommenderas i början ;-)</li>"+"</ul>",step3:'I övre högra hörnet öppnas dialogrutan "Hjälp" med den associerade dialogrutan. <br> <br> Hjälpdialogen sammanfattar handledning, beskrivningar, information, etc.',step4:'Och till vänster öppnar exemplet dialogrutan "exemplar". <br> <br> Det finns många exempel som kan användas för att lära sig stegvis.',step5:"Överst till vänster öppnar konfigurationsdialogen konfigurationsdialogen. <br> <br> Det låter användarna anpassa flera aspekter av körning, användargränssnitt, inställningar etc.",step6:'Grattis! Du känner till nyckelelementen i WepSIM-gränssnittet. <br> I dialogrutan "Hjälp" kan du komma åt "Välkommen handledning" för att fortsätta lära. <br> <br>',_last_:"_last_"};i18n.eltos.cfg.sv={General:"Allmän","Idiom for help, examples, etc.":"Idiom för hjälp, exempel etc.","Notification speed: time before disapear":"Meddelandehastighet: Tid innan försvinner",Editor:"Redaktör","Editor theme: light or dark":"Redaktörstema: ljus eller mörk",Light:"Ljus",Dark:"Mörk","Editor mode: vim, emacs, etc.":"Redigeringsläge: VIM, Emacs, etc.",Execution:"Avrättning","Running speed: execution speed":"Körhastighet: körhastighet",Slow:"Långsam",Normal:"Vanligt",Fast:"Fast","Step-by-step: element in run mode":"Steg för steg: element i körläge",Instructions:"Instruktioner",Instruction:"Instruktion","&#181;instructions":"μinstructions",microInstruction:"μInstruction","Breakpoint icon: icon to be used for breakpoints":"Breakpoint-ikon: ikon som ska användas för brytpunkter","Limit instructions: number of instructions to be executed":"Begränsningsinstruktioner: Antal instruktioner som ska utföras","Limit instruction ticks: to limit clock ticks":"Gränsvärden för inriktning: klockfästgräns per instruktion","Register file":"Registrera filen","Display format":"Displayformat","Register file names":"Registrera filnamn",Numbers:"Tal",Labels:"Etiketter","Editable registers: edit register file values":"Redigerbara register: redigera registerfilvärden","Circuitry simulation":"Circuitry simulering","Data-path color":"Data-bana färg","Signal color":"Signalfärg","Show by value or by activation":"Visa efter värde eller genom aktivering",Value:"Värde",Activation:"Aktivering","Interactive mode: signal value can be updated":"Interaktivt läge: signalvärde kan uppdateras","Quick interactive mode: quick update of signal value":"Snabbt interaktivt läge: snabb uppdatering av signalvärdet","WepSIM User Interface skin":"WepSIM User Interface-hud","(example)":"(exempel)",Accesibility:"Tillgänglighet","Active voice: external voice control":"Aktiv röst: extern röststyrning","Verbalization: textual or mathematical":"Verbalisering: text- eller matematisk","WepSIM User Interface views":"WepSIM User Interface visningar",_last_:"_last_"};i18n.eltos.help.sv={"Welcome tutorial":"Välkommen handledning",help_01_01:"Öppna välkomsthandledningen","Simple usage tutorial":"Enkel användarhandledning",help_01_02:"Öppna den enkla användarhandledningen, för programmering av mikroprogrammering och montering","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"Simulator: firmware",help_02_01:"Hur man arbetar med den fasta programvaran som ska laddas i kontrollminnet","Microcode format":"Mikrokod format",help_02_02:"Syntax av den använda mikrokoden","Simulator: assembly":"Simulator: montering",help_02_03:"Hur man arbetar med enheten som använder den tidigare nämnda firmware","Assembly format":"Monteringsformat",help_02_04:"Syntax av monteringselementen","Simulator: execution":"Simulator: utförande",help_02_05:"Hur simulatorn kan exekvera enheten och firmware","Simulated architecture":"Simulerad arkitektur",help_03_01:"Beskrivning av den simulerade processorns arkitektur","Simulated signals":"Simulerade signaler",help_03_02:"Huvudsignal sammanfattning av den simulerade elementprocessorn","Hardware summary":"Hårdvara sammanfattning",help_03_03:"Referenskort för den simulerade elementhanteraren hårdvara","License, platforms, etc.":"Licens, plattformar etc.",help_04_01:"WepSIM-licens, stödja plattformar, använd teknik",Authors:"Författare",help_04_02:"Författare till WepSIM",_last_:"_last_"};i18n.eltos.states.sv={States:"stater",Current:"Nuvarande","Current State":"Nuvarande tillstånd",History:"Historia",None:"Ingen","Empty history":"Tom historia","Empty (only modified values are shown)":"Tom (endast modifierade värden visas)",Differences:"skillnader","differences with clipboard state":"skillnader med urklippsstatus","Meets the specified requirements":"Uppfyller de angivna kraven",history:"historia",Add:"Lägg till","'Current State' to History":'"Aktuell stat" till historia',Check:"Kontrollera",Copy:"Kopia","to clipboard":"till urklippet",Checkpoint:"Kontrollstation","File name":"Filnamn","Tag for checkpoint":"Tagg för checkpunkt","File to be loaded":"Fil som ska laddas","Save to File":"Spara till fil","State(s) to checkpoint":"Ange till checkpunkt","Record to checkpoint":"Spela in till kontrollpunkten","Browser cache":"Webbläsarens cache","Session to be restore":"Session ska återställas",_last_:"_last_"};i18n.eltos.examples.sv={"addv + seqv.":"addv + seqv.","Alloc.s":"Alloc.s","Dummy instruction":"Dummy instruktion",Exception:"Undantag",Instructions:"Instruktioner",Interruptions:"avbrott","Int. + syscall + except.":"Int. + syscall + förutom.","I/O":"I / O",Looping:"looping","madd, mmul, mxch":"Hjälp, humör, sinne","Masks & shift":"Masker & Skift",Matrix:"Matris","Memory access":"Minnesåtkomst","SC 1, 4-5, 8, 11-12":"SC 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"subrutin","syscall 1, 4-5, 8, 11-12":"syscall 1, 4-5, 8, 11-12","System call":"Systemanrop",Threads:"Trådar",Vector:"Vektor","Compiler Explorer":"Compiler Explorer",example_04_01:"Avancerat exempel med avbrott, systemanrop och undantag.",example_05_01:"Applikationsspecifik förlängning: addv + seqv.",example_05_03:"Applikationsspecifik förlängning: madd + mmul + mxch.",example_05_02:"Applikationsspecifik förlängning: strlen_2 + skipasciicode_2.",example_03_01:"<b> Instruktivt </ b> exempel med undantag för flytpunkten.",example_03_02:"<b> Instruktivt </ b> exempel med avbrottstöd: hämta, RETI och .ktext / .kdata.",example_03_03:"<b> Instruktivt </ b> exempel med systemsamtalstöd.",example_04_04:"Exempel på malloc + fri.",example_04_02:"Exempel på syscall för att skriva / läsa heltal och sträng.",example_04_03:"Exempel på trådar.",example_03_01b:"Exempel med undantag för flytpunkten.",example_03_02b:"Exempel med avbrott stöd: Hämta, RETI och. Text / .kdata.",example_02_01:"Exempel med programmerad I / O-åtkomst och grundläggande .text / .data-segment.",example_03_03b:"Exempel med systemsamtalstöd.",example_02_02:"Utökat exempel med fler instruktioner och I / O (tangentbord, display).",example_02_04:"Utökat exempel med underrutin och matris.",example_02_03:"Mer utökat exempel med mask, skift och grundläggande .text / .data segment.",example_01_01:"Enkelt exempel med hämtning, aritmetiska instruktioner och grundläggande .text segment.",example_01_04:"Enkelt exempel med hämta, filial och grundläggande .text / .data segment.",example_01_03:"Enkelt exempel med hämta, filial och grundläggande .text segment.",example_01_02:"Enkelt exempel med hämtning, minnesåtkomst och grundläggande .text / .data segment.",example_06_01:"Test exempel.",example_06_02:"Simple Compiler Explorer exempel.",Advanced:"Avancerad",Initial:"Första",Intermediate:"Mellanliggande",Laboratory:"Laboratorium","Operating Systems":"Operativsystem",Special:"Särskild","Load example":"Ladda exempel","Load Assembly only":"Endast lastmontering","Load Firmware only":"Ladda endast fast programvara","Copy reference to clipboard":"Kopiera referens till Urklipp",Share:"Dela","No examples available...":"Inga exempel finns tillgängliga för den valda hårdvaran","Simple example":"Enkelt exempel.",_last_:"_last_"};i18n.eltos.dialogs.sv={"Show/Hide ActionBar":"Visa / Dölj ActionBar","Show/Hide Slider":"Visa / Dölj Slider","Initial intro":"Inledande intro","About WepSIM":"Om WepSIM",Title:"Titel",Message:"Meddelande",Duration:"Varaktighet","Confirm remove record...":"Vill du ta bort den aktuella posten?","Close or Reset...":"Vänligen klicka på Stäng för att hålla den, <br> eller klicka på Återställ-knappen för att ta bort den.","Sure Control Memory...":"Vill du att jag ska spara det aktuella kontrollminneinnehållet istället för redaktörens innehåll?","Show/Hide labels":"Visa / Dölj etiketter","Show/Hide content":"Visa / Dölj innehåll","Show/Hide assembly":"Visa / Dölj monteringen","Show/Hide pseudo-instructions":"Visa / Dölj pseudo-instruktioner",Close:"Stänga",_last_:"_last_"};i18n.eltos.gui.de={"Loading WepSIM...":"WepSIM wird geladen ...",Configuration:"Aufbau",MicroCode:"MicroCode",Assembly:"Versammlung",Simulator:"Simulator",Examples:"Beispiele",Load:"Belastung",Save:"sparen","Load/Save":"Belastung/sparen",Restore:"Wiederherstellen",Help:"Hilfe",Notifications:"Benachrichtigungen",RecordBar:"Aufnahmeleiste",Input:"Eingang",Output:"Ausgabe","Help Index":"Hilfe-Index",Processor:"Prozessor","Assembly Debugger":"Assembly Debugger",Reset:"Zurücksetzen",microInstruction:"µAnweisung",Instruction:"Anweisung",Run:"Lauf","Hardware Summary":"Hardware-Zusammenfassung",processor:"Prozessor",details:"details",microcode:"Mikrocode",Signals:"Signale",Behaviors:"Verhaltensweisen",States:"Zustände","Control States":"Kontrollzustände",Dependencies:"Abhängigkeiten",Close:"Schließen",Description:"Beschreibung",Show:"Show","Show Main Memory":"Hauptspeicher anzeigen",compile:"kompilieren",Compile:"Kompilieren","Please write the file name":"Bitte schreiben Sie den Dateinamen","Load from this File":"Laden Sie aus dieser Datei",labels:"labels",addr:"Adr",ess:"ess",content:"Inhalt",assembly:"Versammlung",instructions:"Anleitung","simulator intro 1":"Sie können die zu verwendende Hardware auswählen. Die Standardhardware ist die EP-Hardware (Elemental Processor). <br> Sie können <span class='text-primary bg-light' onclick=\"setTimeout(function(){$('#dd1').dropdown('toggle');},50);\">den Modus-Wahlschalter</span>, um die verwendete Hardware zu ändern.","simulator intro 2":"Dann müssen Sie den Mikrocode (definiert den Befehlssatz) und den Assembler-Code laden. <br> Sie können <span class='text-primary bg-light' onclick='wsweb_dialog_open(\"examples\");'> ein Beispiel</span>, <span class ='text-primary bg-light' onclick='wsweb_select_action(\"checkpoint\");'>lade es aus einer Datei</span> oder Sie können <span class='text-primary bg-light' onclick='wsweb_change_workspace_microcode();'>einen neuen Mikrocode</span> und <span class='text-primary bg-light' onclick='wsweb_change_workspace_assembly();'>ein neuer Assembly-Code</span>. ","simulator intro 3":"Schließlich können Sie im Simulator den zuvor geladenen Mikrocode plus Assembly ausführen. <br> Sie können ihn sowohl auf Mikrobefehls- als auch auf Assemblybefehlsebene ausführen.","Prev.":"Vorherige",Next:"Nächster",End:"Ende","Disable tutorial mode":"Tutorial-Modus deaktivieren",Comment:"Kommentar",Pause:"Pause",Play:"abspielen",Stop:"Halt",Record:"Aufzeichnung",Registers:"Register","Control Memory":"Steuerspeicher",Stats:"Statistik",Memory:"Erinnerung","Keyboard+Display":"Tastatur + Display","I/O Stats":"I/O Statistik","I/O Configuration":"I/O Konfiguration",Recent:"Kürzlich",Refresh:"Aktualisierung",Welcome:"Herzlich willkommen","Microcode & Assembly":"WepSIM hardware","Pick firm/soft":"Wählen Sie Firm/Soft aus",Information:"Informationen von",Native:"Nativer","MIPS32-like":"MIPS32-ähnlicher",RISCV32:"RISCV32","Z80-like":"Z80-ähnlicher",_last_:"_last_"};i18n.eltos.tutorial_welcome.de={title_0:"Willkommen im WepSIM-Simulator!",message_0:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/simulator012.jpg' style = 'maximale Breite: 100%; max-height: 40vh; '> </center> <p> <h5> In diesem kurzen Tutorial erfahren Sie, wie Sie: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe (\"welcome\") , 0,1); '> Laden Sie ein Beispiel. </a> </li> <li> <a href='#'onclick='sim_tutorial_goframe(\"welcome\",0,2);'> Führen Sie ein Beispiel aus. </a> </li> <li> <a href='#'onclick='sim_tutorial_goframe(\"welcome\",0,3);'> Konfigurieren Sie die Simulation. </a> </li> <li> <a href = '#' onclick = 'sim_tutorial_goframe (\"welcome\", 0,4);'> Holen Sie sich Hilfe. </a> </li> </ol> </h5>",title_1:"Wie lade ich ein Beispiel?",message_1:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/example_usage.gif' style = 'maximale Breite: 100%; max-height: 60vh '> </center> <p> <h5> Klicken Sie auf die Schaltfläche' example 'und dann auf den Beispielnamen' title '. <br> Dann wird das Beispiel für Mikrocode und Assembly geladen und mikrokompiliert und kompiliert. <br> <br> </h5>",title_2:"So führen Sie ein Beispiel aus.",message_2:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/simulation_xinstruction.gif' style = 'maximale Breite: 100%; max-height: 60vh '> </center> <p> <h5> Klicken Sie auf die nächste Anweisung/Mikroanweisung, um Schritt für Schritt auszuführen. <br> Klicken Sie auf die Schaltfläche Ausführen, um bis zum ersten Haltepunkt oder dem Ende des Assemblierungsprogramms auszuführen. <br> </h5>",title_3:"So konfigurieren Sie WepSIM.",message_3:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/config_usage.gif' style = 'maximale Breite: 100%; max-height: 60vh '> </center> <p> <h5> Klicken Sie auf die Schaltfläche \"Konfiguration\", und Benutzer können verschiedene Teile von WepSIM anpassen. <br> </h5>",title_4:"So erhalten Sie die grundlegende Hilfe.",message_4:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/help_usage.gif' style = 'maximale Breite: 100%; max-height: 60vh '> </center> <p> <h5> Klicken Sie auf die grüne Schaltfläche \"Hilfe\", um zum Hilfedialog zu gelangen. <br> Sie können die Sprache (Spanisch/Englisch) wechseln Hilfeindex oder Hilfedialog schließen. <br> </h5>",title_5:"Willkommen bei WepSIM!",message_5:"<center> <img alt = 'wepsim screenshot' src = 'images/welcome/help_usage.gif' style = 'maximale Breite: 100%; max-height: 60vh '> </center> <p> <h5> Weitere Informationen finden Sie in den Hilfeabschnitten. <br> Wenn Sie auf die Schaltfläche zum Beenden dieses Tutorials klicken, lädt WepSIM das erste Beispiel für Sie. Viel Spaß! <br> </h5>",_last_:"_last_"};i18n.eltos.tutorial_simpleusage.de={title_0:"Einfaches WepSIM-Erlebnis: Mikroprogrammierung und Programmierung",message_0:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/simulator011.jpg' style = 'maximale Breite: 100%; max-height: 40vh; '> </center> <p> <h5> In diesem kurzen Tutorial erfahren Sie, wie Sie: <ol> <li> <a href =' # 'onclick =' sim_tutorial_goframe (\"simpleusage\") , 0,1); '> Bearbeiten Sie Ihren Mikrocode. </a> </li> <li> <a href='#'onclick='sim_tutorial_goframe(\"simpleusage\",0,3);'> Bearbeiten Sie Ihre Baugruppe ( basierend auf dem vorherigen Mikrocode). </a> </li> <li> <a href='#'onclick='sim_tutorial_goframe(\"simpleusage\",0,5);'> Führe den Assembly + Mikrocode in der Simulation aus. </a> </li> </ol> </h5>",title_1:"Einfaches WepSIM-Erlebnis: Mikroprogrammierung und Programmierung",message_1:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/firmware001.jpg' style = 'maximale Breite: 100%; maximale Höhe: 40 vh; '> </center> <p> <h5> Der erste Schritt ist die Mikroprogrammierung der zu verwendenden Firmware. Verwenden Sie die Schaltfläche 'Microcode', um zum Microcode-Bildschirm zu wechseln. </H5>",title_2:"Einfaches WepSIM-Erlebnis: Mikroprogrammierung und Programmierung",message_2:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/firmware002.jpg' style = 'maximale Breite: 100%; max-height: 40vh; '> </center> <p> <h5> Der Mikroprogrammierbildschirm enthält: <ul> <li> Den Editor für den Mikrocode. </li> <li> Den Mikrocompiler. </li> < li> Die Hardware-Übersicht und Hilfe. </li> </ul> Sobald Ihr Code fertig ist (ohne Fehler kompiliert), müssen Sie zum Assembly-Bildschirm gehen. </h5>",title_3:"Einfaches WepSIM-Erlebnis: Mikroprogrammierung und Programmierung",message_3:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/assembly002b.jpg' style = 'maximale Breite: 100%; max-height: 40vh; '> </center> <p> <h5> Der zweite Schritt ist die Programmierung der auszuführenden Baugruppe. Verwenden Sie die Schaltfläche \"Zusammenbau\" sowohl auf dem Simulatorbildschirm als auch auf dem Mikrocode-Bildschirm. </H5>",title_4:"Einfaches WepSIM-Erlebnis: Mikroprogrammierung und Programmierung",message_4:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/assembly003.jpg' style = 'maximale Breite: 100%; max-height: 40vh; '> </center> <p> <h5> Der Programmierbildschirm enthält: <ul> <li> Den Editor für den Assembly-Code. </li> <li> Den Assembly-Compiler. </li > <li> Der Memory Map Viewer und die Hilfe. </li> </ul> Sobald Ihr Assebly-Code fertig ist (bearbeitet und fehlerfrei kompiliert), müssen Sie in den Simulationsbildschirm wechseln. </h5>",title_5:"Einfaches WepSIM-Erlebnis: Mikroprogrammierung und Programmierung",message_5:"<center> <img alt = 'wepsim screenshot' src = 'images/simulator/simulator010.jpg' style = 'maximale Breite: 100%; max-height: 40vh; '> </center> <p> <h5> Der dritte Schritt besteht darin, den Assembly-Code im Simulator auszuführen. <br> Der Simulatorbildschirm bietet Folgendes: <ul> <li> Die Assembly- und Hardware-Ansicht </li> <li> Die Detailansicht der Register, des Steuerspeichers, des Hauptspeichers usw. </li> <li> Das Zurücksetzen, schrittweise oder bis zum Haltepunkt/Ende der Aktionen ausführen. </li> </ul > In diesem Tutorial wird die typische Verwendung von WepSIM für Schüler und Lehrer vorgestellt. Viel Spaß mit WepSIM! </H5>",_last_:"_last_"};i18n.eltos.tour_intro.de={step1:"WepSIM hilft dabei, die Funktionsweise eines Computers besser zu verstehen: Es ist visuell, interaktiv, integriert von Signalen bis hin zu Unterbrechungen, Systemaufrufen, Ausnahmen usw. <br> <br> Wir sind der festen Überzeugung, dass WepSIM ein revolutionäres Lehrmittel ist. Diese kurze Tour führt in die wichtigsten Elemente der Benutzeroberfläche ein.",step2:"Diese Schaltfläche oben rechts ist ein Schnellzugriffsmenü auf verschiedene 'Arbeitsmodi'. <br>"+"<br>"+"Benutzer können auswählen:"+"<ul>"+"<li>Die Hardware, mit der gearbeitet werden soll (z. B. EP - Prozessor usw.)</li>"+"<li>Nur Assembly-Modus mit ganzzahligen MIPS <sub> 32 </ sub> - oder RISC-V <sub>32</sub>-Anweisungen</li>"+"<li>Der zu Beginn empfohlene Lernmodus; -)</li>"+"</ul>",step3:'Oben rechts öffnet die Schaltfläche "Hilfe" den zugehörigen Dialog. <br> <br> Der Hilfedialog fasst die Tutorials, Beschreibungen, Informationen usw. zusammen.',step4:'Und auf der linken Seite öffnet die Schaltfläche "Beispiele" den Beispieldialog. <br> <br> Es gibt viele Beispiele, die zum schrittweisen Lernen verwendet werden können.',step5:'Oben links wird über die Schaltfläche "Konfiguration" der Konfigurationsdialog geöffnet. <br> <br> Mit dieser Schaltfläche können Benutzer verschiedene Aspekte der Ausführung, der Benutzeroberfläche, der Einstellungen usw. anpassen.',step6:'Herzlichen Glückwunsch! Sie kennen die wichtigsten Elemente der WepSIM-Benutzeroberfläche. <br> Über das Dialogfeld "Hilfe" können Sie auf das Lernprogramm "Willkommen" zugreifen, um mit dem Lernen fortzufahren. <br>',_last_:"_last_"};i18n.eltos.cfg.de={General:"Allgemeines","Idiom for help, examples, etc.":"Sprache für Hilfe, Beispiele usw.","Notification speed: time before disapear":"Benachrichtigungsgeschwindigkeit: Zeit bis zum Verschwinden",Editor:"Editor","Editor theme: light or dark":"Herausgeber Thema: hell oder dunkel",Light:"Licht",Dark:"Dunkel","Editor mode: vim, emacs, etc.":"Editormodus: vim, emacs usw.",Execution:"Ausführung","Running speed: execution speed":"Laufgeschwindigkeit: Ausführungsgeschwindigkeit",Slow:"Schleppend",Normal:"Normal",Fast:"Fast","Step-by-step: element in run mode":"Schritt für Schritt: Element im Run-Modus",Instructions:"Anleitung",Instruction:"Anweisung","&#181;instructions":"µAnweisungen",microInstruction:"µAnweisung","Breakpoint icon: icon to be used for breakpoints":"Haltepunktsymbol: Symbol für Haltepunkte","Limit instructions: number of instructions to be executed":"Limitinstruktionen: Anzahl der auszuführenden Instruktionen","Limit instruction ticks: to limit clock ticks":"Limit Instruction Ticks: Zeitlimit pro Instruktion","Register file":"Datei registrieren","Display format":"Anzeigeformat","Register file names":"Registrieren Sie Dateinamen",Numbers:"Zahlen",Labels:"Labels","Editable registers: edit register file values":"Bearbeitbare Register: Bearbeiten Sie die Werte der Registerdateien","Circuitry simulation":"Schaltungssimulation","Data-path color":"Datenpfadfarbe","Signal color":"Signalfarbe","Show by value or by activation":"Zeige nach Wert oder nach Aktivierung",Value:"Wert",Activation:"Aktivierung","Interactive mode: signal value can be updated":"Interaktiver Modus: Signalwert kann aktualisiert werden","Quick interactive mode: quick update of signal value":"Schneller interaktiver Modus: Schnelle Aktualisierung des Signalwerts","(example)":"(Beispiel)",Accesibility:"Zugänglichkeit","Active voice: external voice control":"Aktive Stimme: Externe Sprachsteuerung","Verbalization: textual or mathematical":"Verbalisierung: Text oder Mathematik","WepSIM User Interface views":"Ansichten der WepSIM-Benutzeroberfläche",_last_:"_last_"};i18n.eltos.help.de={"Welcome tutorial":"Willkommens-Tutorial",help_01_01:"Öffnen Sie das Willkommens-Tutorial","Simple usage tutorial":"Einfaches Tutorial",help_01_02:"Öffnen Sie das einfache Lernprogramm für die Mikroprogrammierung und Montageprogrammierung","Execute example":"Execute example",help_01_03:"Play the execute example tutorial","Simulator: firmware":"Simulator: firmware",help_02_01:"So arbeiten Sie mit der Firmware, die in den Steuerungsspeicher geladen werden soll","Microcode format":"Microcode format",help_02_02:"Syntax des verwendeten Mikrocodes","Simulator: assembly":"Simulator: Zusammenbau",help_02_03:"So arbeiten Sie mit der Baugruppe, die die oben genannte Firmware verwendet","Assembly format":"Montageformat",help_02_04:"Syntax der Assembly-Elemente","Simulator: execution":"Simulator: Ausführung",help_02_05:"Wie der Simulator die Baugruppe und Firmware ausführen kann","Simulated architecture":"Simulierte Architektur",help_03_01:"Beschreibung der simulierten Prozessorarchitektur","Simulated signals":"Simulierte Signale",help_03_02:"Zusammenfassung der Hauptsignale des simulierten Elementarprozessors","Hardware summary":"Hardware-Zusammenfassung",help_03_03:"Referenzkarte für die Hardware des simulierten Elementarprozessors","License, platforms, etc.":"Lizenz, Plattformen usw.",help_04_01:"WepSIM-Lizenz, unterstützte Plattformen, verwendete Technologien",Authors:"Autoren",help_04_02:"Autoren von WepSIM",_last_:"_last_"};i18n.eltos.states.de={States:"Zustände",Current:"Aktuell","Current State":"Aktuellen Zustand",History:"Geschichte",None:"Keiner","Empty history":"Leere Geschichte","Empty (only modified values are shown)":"Leer (nur geänderte Werte werden angezeigt)",Differences:"Unterschiede","differences with clipboard state":"Unterschiede zum Status der Zwischenablage","Meets the specified requirements":"Erfüllt die angegebenen Anforderungen",history:"Geschichte",Add:"Hinzufügen","'Current State' to History":"Aktueller Stand der Geschichte",Check:"Prüfen",Copy:"Kopieren","to clipboard":"Zur Zwischenablage",Checkpoint:"Kontrollpunkt","File name":"Dateiname","Tag for checkpoint":"Tag für Checkpoint","File to be loaded":"Zu ladende Datei","Save to File":"Speichern unter","State(s) to checkpoint":"Zustand (e) zum Prüfpunkt","Record to checkpoint":"Zum Checkpoint aufnehmen","Browser cache":"Browser-Cache","Session to be restore":"Sitzung, die wiederhergestellt werden soll",_last_:"_last_"};i18n.eltos.examples.de={"addv + seqv.":"addv + seqv.","Alloc.s":"Alloc.s","Dummy instruction":"Dummy-Anweisung",Exception:"Ausnahme",Instructions:"Anleitung",Interruptions:"Unterbrechungen","Int. + syscall + except.":"Int. + syscall + außer.","I/O":"H/O",Looping:"Looping","madd, mmul, mxch":"Hilfe, Stimmung, Verstand","Masks & shift":"Masken & Verschiebung",Matrix:"Matrix","Memory access":"Speicherzugriff","SC 1, 4-5, 8, 11-12":"SC 1, 4-5, 8, 11-12","strlen_2 + skipasciicode_2":"strlen_2 + skipasciicode_2",Subrutine:"Unterprogramm","syscall 1, 4-5, 8, 11-12":"syscall 1, 4-5, 8, 11-12","System call":"Systemaufruf",Threads:"Themen",Vector:"Vektor","Compiler Explorer":"Compiler-Explorer",example_04_01:"Erweitertes Beispiel mit Unterbrechung, Systemaufruf und Ausnahme.",example_05_01:"Anwendungsspezifische Erweiterung: addv + seqv.",example_05_03:"Anwendungsspezifische Erweiterung: madd + mmul + mxch.",example_05_02:"Anwendungsspezifische Erweiterung: strlen_2 + skipasciicode_2.",example_03_01:"<b> Lehrbeispiel </b> mit Gleitkomma-Ausnahme.",example_03_02:"<b> Anleitendes </b> Beispiel mit Unterstützung für Unterbrechungen: Fetch, RETI und .ktext/.kdata.",example_03_03:"<b> Anleitendes </b> Beispiel mit Unterstützung für Systemaufrufe.",example_04_04:"Beispiel für malloc + free.",example_04_02:"Beispiel für syscall zum Drucken/Lesen von Integer und String.",example_04_03:"Beispiel für Threads.",example_03_01b:"Beispiel mit Gleitkomma-Ausnahme.",example_03_02b:"Beispiel mit Unterbrechungsunterstützung: Fetch, RETI und .ktext/.kdata.",example_02_01:"Beispiel mit programmiertem E/A-Zugriff und einfachem Text/Daten-Segment.",example_03_03b:"Beispiel mit Systemaufrufunterstützung.",example_02_02:"Erweitertes Beispiel mit mehr Anweisungen und I/O (Tastatur, Display).",example_02_04:"Erweitertes Beispiel mit Subrutine und Matrix.",example_02_03:"Erweitertes Beispiel mit Masken, Shift und einfachem .text/.data-Segment.",example_01_01:"Einfaches Beispiel mit Fetch-, Arithmetik- und Basic-Text-Segment.",example_01_04:"Einfaches Beispiel mit Fetch-, Branch- und Basic-Segment .text/.data.",example_01_03:"Einfaches Beispiel mit Fetch-, Branch- und Basic-Textsegment.",example_01_02:"Einfaches Beispiel mit Abruf, Speicherzugriff und grundlegendem .text/.data-Segment.",example_06_01:"Testbeispiel.",example_06_02:"Einfaches Beispiel für den Compiler-Explorer.",Advanced:"Fortgeschritten",Initial:"Initiale",Intermediate:"Mittlere",Laboratory:"Labor","Operating Systems":"Betriebssysteme",Special:"Besondere","Load example":"Beispiel laden","Load Assembly only":"Nur Baugruppe laden","Load Firmware only":"Nur Firmware laden","Copy reference to clipboard":"Kopieren Sie den Verweis in die Zwischenablage",Share:"Aktie","No examples available...":"Für die ausgewählte Hardware sind keine Beispiele verfügbar","Simple example":"Einfaches Beispiel.",_last_:"_last_"};i18n.eltos.dialogs.de={"Show/Hide ActionBar":"Aktionsleiste ein- / ausblenden","Show/Hide Slider":"Schieberegler ein- / ausblenden","WepSIM User Interface skin":"WepSIM-Benutzeroberflächen-Skin","Initial intro":"Anfängliches Intro","About WepSIM":"Über WepSIM",Title:"Titel",Message:"Botschaft",Duration:"Dauer","Confirm remove record...":"Möchten Sie den aktuellen Datensatz entfernen?","Close or Reset...":"Bitte klicken Sie auf Schließen, um es zu behalten, oder klicken Sie auf die Schaltfläche Zurücksetzen, um es zu entfernen.","Sure Control Memory...":"Möchten Sie, dass ich den aktuellen Control Memory-Inhalt und nicht den Editor-Inhalt speichere?","Show/Hide labels":"Beschriftungen ein- / ausblenden","Show/Hide content":"Inhalt ein- / ausblenden","Show/Hide assembly":"Baugruppe ein- / ausblenden","Show/Hide pseudo-instructions":"Pseudo-Anweisungen ein- / ausblenden",Close:"Schließen",_last_:"_last_"};function wepsim_file_saveTo(textToWrite,fileNameToSaveAs){window.requestFileSystem=window.requestFileSystem||window.webkitRequestFileSystem;if(typeof window.requestFileSystem==="undefined"){return false}var koHandler=function(error){wepsim_notify_error("<strong>ERROR</strong>: failed file write","Failed file write. "+"Error found "+error.toString())};var okHandler=function(msg){wepsim_notify_success("<strong>INFO</strong>","Successful file write request: "+fileNameToSaveAs)};var onWriteFile=function(fileWriter){var textFileAsBlob=new Blob([textToWrite],{type:"text/plain"});fileWriter.onerror=koHandler;fileWriter.onwriteend=okHandler;fileWriter.write(textFileAsBlob)};var onCreatFile=function(fileEntry){fileEntry.createWriter(onWriteFile)};var onInitFs=function(fs){fs.root.getFile(fileNameToSaveAs,{create:true,exclusive:false},onCreatFile,koHandler)};var grandedBytes=2*1024*1024;var onQuotaFs=function(grantedBytes){window.requestFileSystem(PERSISTENT,grandedBytes,onInitFs,koHandler)};navigator.webkitPersistentStorage.requestQuota(grandedBytes,onQuotaFs,koHandler);return true}function wepsim_file_loadFrom(fileToLoad,functionOnLoad){var fileReader=new FileReader;if(fileReader===null){return false}fileReader.onload=function(fileLoadedEvent){var textFromFileLoaded=fileLoadedEvent.target.result;if(null!==functionOnLoad){functionOnLoad(textFromFileLoaded)}};fileReader.onerror=function(e){wepsim_notify_error("<strong>ERROR</strong>","File could not be read. "+"Error code "+e.target.error.code)};fileReader.readAsText(fileToLoad,"UTF-8");return true}function wepsim_file_downloadTo(textToWrite,fileNameToSaveAs){var windowURL=window.webkitURL||window.URL;var textFileAsBlob=new Blob([textToWrite],{type:"text/plain"});var downloadLink=document.createElement("a");downloadLink.innerHTML="Download File";downloadLink.style.display="none";downloadLink.download=fileNameToSaveAs;downloadLink.href=windowURL.createObjectURL(textFileAsBlob);downloadLink.onclick=function(event){document.body.removeChild(event.target)};document.body.appendChild(downloadLink);downloadLink.click();wepsim_notify_success("<strong>INFO</strong>","Successful opportunity for downloading: "+fileNameToSaveAs)}function getURLTimeStamp(){var dateObj=new Date;var year=dateObj.getUTCFullYear();var month=dateObj.getUTCMonth()+1;var day=dateObj.getUTCDate();var hour=dateObj.getUTCHours();var minutes=dateObj.getUTCMinutes();return year+month+day+hour+minutes}function fetchURL(f_url){if(navigator.onLine){return fetch(f_url+"?time="+getURLTimeStamp())}return caches.match(f_url)}function wepsim_save_to_file(textToWrite,fileNameToSaveAs){var ret=false;if(is_cordova())ret=wepsim_file_saveTo(textToWrite,fileNameToSaveAs);else ret=wepsim_file_downloadTo(textToWrite,fileNameToSaveAs);return ret}function wepsim_load_from_url(url,do_next){if(false===is_mobile()){fetchURL(url).then((function(response){if(typeof response=="undefined"){wepsim_notify_error("<strong>ERROR</strong>","File "+url+" could not be fetched:"+" * Please check that you are on-line.");return}if(response.ok){response.text().then((function(text){do_next(text)}))}}))}else{var xmlhttp=new XMLHttpRequest;xmlhttp.onreadystatechange=function(){if(xmlhttp.readyState==4&&(xmlhttp.status==200||xmlhttp.status==0)){var textFromFileLoaded=xmlhttp.responseText;if(null!==do_next)do_next(textFromFileLoaded)}};xmlhttp.open("GET",url,true);xmlhttp.send()}}function wepsim_url_getJSON(url_json){var jstr={};var jobj=[];try{jstr=$.getJSON({url:url_json,async:false});jobj=JSON.parse(jstr.responseText)}catch(e){ws_alert("Unable to load '"+url_json+"': "+e+".\n");jobj=[]}return jobj}function wepsim_url_json(json_url,do_after){var xhr=new XMLHttpRequest;xhr.open("HEAD",json_url,true);xhr.onreadystatechange=function(){if(this.readyState==this.DONE){var size=0;var content_length=xhr.getResponseHeader("Content-Length");if(content_length!==null){size=parseInt(content_length)}var max_json_size=get_cfg("max_json_size");if(size<max_json_size){$.getJSON(json_url,do_after).fail((function(e){wepsim_notify_do_notify("getJSON","There was some problem for getting "+json_url,"warning",0)}))}}};xhr.send()}var clipboard_copy="";function get_clipboard_copy(){return clipboard_copy}function SelectText(element){var doc=document,text=doc.getElementById(element),range,selection;if(doc.body.createTextRange){range=document.body.createTextRange();range.moveToElementText(text);range.select()}else if(window.getSelection){selection=window.getSelection();range=document.createRange();range.selectNodeContents(text);selection.removeAllRanges();selection.addRange(range)}}function wepsim_clipboard_CopyFromDiv(element_name){var msg="unsuccessful";try{SelectText(element_name);if(document.execCommand("copy")){clipboard_copy=$("#"+element_name).text();msg="successful"}}catch(e){msg+=msg+" because "+e}wepsim_notify_success("<strong>INFO</strong>","Copied "+msg+"!.")}function wepsim_clipboard_CopyFromTextarea(element_name){var msg="successful";try{var copyTextarea=document.getElementById(element_name);copyTextarea.select();document.execCommand("copy");clipboard_copy=$("#"+element_name).val()}catch(err){msg="unsuccessful"}wepsim_notify_success("<strong>INFO</strong>","Copied "+msg+"!.")}var ws_preload_tasks=[{name:"mode",action:function(hash){var ws_mode=get_cfg("ws_mode");if(hash.mode!==ws_mode)wsweb_select_main(hash.mode);return"<li>Mode set to <strong>"+hash.mode+"</strong>.</li> "}},{name:"config_set",action:function(hash){cfgset_load(hash.config_set);wepsim_uicfg_restore();return"<li>Configuration set titled <strong>"+hash.config_set+"</strong> loaded.</li>"}},{name:"examples_set",action:function(hash){var url_examples_set=get_cfg("example_url");var ret=wepsim_example_loadSet(url_examples_set);wepsim_example_reset();wepsim_example_load(hash.examples_set);var result_txt=" has been loaded";if(null==ret){result_txt=" could not be loaded"}return"<li>Examples set titled <strong>"+hash.examples_set+"</strong>"+result_txt+".</li>"}},{name:"example",action:function(hash){var example_index=parseInt(hash.example);var example_obj=ws_examples[example_index];if(typeof example_obj==="undefined"){return""}var example_uri=example_obj.hardware+":"+example_obj.microcode+":"+example_obj.assembly;load_from_example_firmware(example_uri,true);return"<li>Example titled <strong>"+example_obj.title+"</strong> has been loaded.</li> "}},{name:"simulator",action:function(hash){var panels=hash.simulator.split(":");if(typeof panels[0]!=="undefined"){if(panels[0]==="microcode"){wsweb_change_show_processor()}if(panels[0]==="assembly"){wsweb_change_show_asmdbg()}}if(typeof panels[1]!=="undefined"){wsweb_set_details(panels[1].toUpperCase())}if(typeof panels[2]!=="undefined"){wsweb_do_action(panels[2].toLowerCase())}return"<li>User interface has been adapted.</li> "}},{name:"checkpoint",action:function(hash){uri_obj=new URL(hash.checkpoint);wepsim_checkpoint_loadURI(uri_obj)}},{name:"notify",action:function(hash){return""}},{name:"preload",action:function(hash){return""}}];function wepsim_preload_fromHash(hash){var key="";var act=function(){};var o="";for(var i=0;i<ws_preload_tasks.length;i++){key=ws_preload_tasks[i].name;act=ws_preload_tasks[i].action;if(hash[key]!==""){o=o+act(hash)}}if(o!==""){o="WepSIM has been instructed to preload some work for you:<br>"+"<ul>"+o+"</ul>"+"To close this notification please press in the "+'<span class="btn btn-sm btn-info py-0" data-dismiss="alert">X</span> mark. <br>'+"In order to execute an example please press the "+'<span class="btn btn-sm btn-info py-0" '+"      onclick=\"wepsim_execute_toggle_play('#btn_run_stop');\">Run</span> button.<br>";if(hash.notify.toLowerCase()!=="false"){wepsim_notify_do_notify("WepSIM preloads some work",o,"info",0)}}return 0}function wepsim_preload_get2hash(window_location){var hash={};var hash_field="";var uri_obj=null;if(typeof window_location==="undefined"){return hash}var parameters=new URL(window_location).searchParams;for(i=0;i<ws_preload_tasks.length;i++){hash_field=ws_preload_tasks[i].name;hash[hash_field]=parameters.get(hash_field);if(hash[hash_field]===null){hash[hash_field]=""}}if(hash.preload!==""){try{uri_obj=new URL(hash.preload);wepsim_url_json(uri_obj.pathname,wepsim_preload_fromHash)}catch(e){ws_alert('unable to preload json from "'+uri_obj.pathname+'"')}}return hash}function wepsim_checkpoint_get(tagName){var ws_mode=get_cfg("ws_mode");var history_obj=wepsim_state_history_get();var state_current=wepsim_state_get_clk();var state_obj=simcore_simstate_current2state();state_current.content=simcore_simstate_state2checklist(state_obj);var elements={mode:ws_mode,firmware:inputfirm.getValue(),assembly:inputasm.getValue(),state_current:state_current,state_history:history_obj,record:simcore_record_get(),tag:tagName,notify:true};return elements}function wepsim_checkpoint_loadFromObj(checkpointObj,obj_fileName,obj_tagName,obj_fileToLoad){var o="";var u="";if(checkpointObj===null){return"null checkpoint"}if(typeof checkpointObj.mode==="undefined")checkpointObj.mode="ep";if(typeof checkpointObj.firmware==="undefined")checkpointObj.firmware="";if(typeof checkpointObj.assembly==="undefined")checkpointObj.assembly="";if(typeof checkpointObj.state_history==="undefined")checkpointObj.state_history=[];if(typeof checkpointObj.record==="undefined")checkpointObj.record=[];wepsim_state_history_reset();for(var i=0;i<checkpointObj.state_history.length;i++){state_history.push(checkpointObj.state_history[i])}wepsim_state_history_list();o+="<li>State: restored into the state history.</li>";wsweb_select_main(checkpointObj.mode);inputfirm.setValue(checkpointObj.firmware);inputasm.setValue(checkpointObj.assembly);o+="<li>Firmware and Assembly: Loaded";u="";if(checkpointObj.firmware.trim()!==""){wepsim_compile_firmware(checkpointObj.firmware);u+="Firmware"}if(checkpointObj.assembly.trim()!==""){wepsim_compile_assembly(checkpointObj.assembly);u+=" + Assembly"}if(u!==""){o+=" + Compiled"}o+=".</li>";if(typeof obj_fileName!=="undefined"&&obj_fileName!==null){obj_fileName.value=obj_fileToLoad.name}if(typeof obj_tagName!=="undefined"&&obj_tagName!==null){obj_tagName.value=checkpointObj.tag}o+="<li>Tag: <strong>"+checkpointObj.tag+"</strong></li>";simcore_record_set(checkpointObj.record);if(o!==""){o="WepSIM has been instructed to restore a checkpoint:<br>"+"<ul>"+o+"</ul>"+"To close this notification please press in the "+'<span class="btn btn-sm btn-info py-0" data-dismiss="alert">X</span> mark. <br>'}if(checkpointObj.notify===true){wepsim_notify_do_notify("Restored Checkpoint",o,"info",get_cfg("NOTIF_delay"))}return o}function wepsim_checkpoint_Obj2NB(elements){var val="";var typ="";var cells=[];for(var key in elements){val=elements[key];typ=typeof val;if(typ!=="string"){val=JSON.stringify(val,null,2)}cells.push({cell_type:"markdown",source:"## "+key,metadata:{}});cells.push({cell_type:"code",source:val,outputs:[],execution_count:1,metadata:{name:key,type:typ,collapsed:false,deletable:false,editable:false}})}var nbObj={metadata:{kernelspec:{name:"node_nteract",language:"javascript",display_name:"Node.js (nteract)"},kernel_info:{name:"node_nteract"},language_info:{name:"javascript",version:"8.2.1",mimetype:"application/javascript",file_extension:".js"},title:"WepSIM "+get_cfg("version"),nteract:{version:"nteract-on-jupyter@2.0.0"}},nbformat:4,nbformat_minor:0,cells:cells};return nbObj}function wepsim_checkpoint_NB2Obj(nbObj){var elements={};if(typeof nbObj.cells==="undefined")return elements;if(typeof nbObj.cells.length==="undefined")return elements;var key="";var type="";var value="";for(var i=0;i<nbObj.cells.length;i++){if(nbObj.cells[i].cell_type!=="code"){continue}key=nbObj.cells[i].metadata.name;type=nbObj.cells[i].metadata.type;value=nbObj.cells[i].source;if(type!=="string"){value=JSON.parse(value)}elements[key]=value}return elements}function wepsim_checkpoint_save(id_filename,id_tagname,checkpointObj){var obj_fileName=document.getElementById(id_filename);var obj_tagName=document.getElementById(id_tagname);if(obj_fileName===null||obj_tagName===null){return false}var checkpointNB=wepsim_checkpoint_Obj2NB(checkpointObj);var checkpointStr=JSON.stringify(checkpointNB,null,2);wepsim_save_to_file(checkpointStr,obj_fileName.value);return true}function wepsim_checkpoint_afterLoad(textLoaded,obj_fileName,obj_tagName,obj_fileToLoad){try{var current_checkpoint=null;if(textLoaded!==""){current_checkpoint=JSON.parse(textLoaded);current_checkpoint=wepsim_checkpoint_NB2Obj(current_checkpoint)}wepsim_checkpoint_loadFromObj(current_checkpoint,obj_fileName,obj_tagName,obj_fileToLoad)}catch(e){ws_alert("Error on checkpoint file: "+e)}}function wepsim_checkpoint_load(id_filename,id_tagname,id_file_to_load){var obj_fileName=document.getElementById(id_filename);var obj_tagName=document.getElementById(id_tagname);var obj_fileToLoad=document.getElementById(id_file_to_load).files[0];if(obj_fileName===null||obj_tagName===null||obj_fileToLoad===null||typeof obj_fileToLoad==="undefined"){return false}var function_after_loaded=function(textLoaded){wepsim_checkpoint_afterLoad(textLoaded,obj_fileName,obj_tagName,obj_fileToLoad)};wepsim_file_loadFrom(obj_fileToLoad,function_after_loaded);return true}function wepsim_checkpoint_loadURI(obj_uri){if(typeof obj_uri==="undefined"||obj_uri===null){return false}try{var filename=obj_uri.href.substring(obj_uri.href.lastIndexOf("/")+1);wepsim_url_json(obj_uri.href,(function(data){var obj_refName={name:filename};var current_checkpoint=wepsim_checkpoint_NB2Obj(data);wepsim_checkpoint_loadFromObj(current_checkpoint,null,null,obj_refName)}));return true}catch(e){return false}}function wepsim_checkpoint_loadExample(tutorial_name){var file_uri="examples/checkpoint/"+tutorial_name;var function_after_loaded=function(data_text){var obj_refName={name:file_uri};wepsim_checkpoint_afterLoad(data_text,"FileNameToSaveAs1","tagToSave1",obj_refName)};wepsim_load_from_url(file_uri,function_after_loaded)}function wepsim_checkpoint_share(id_filename,id_tagname,checkpointObj){var obj_fileName=document.getElementById(id_filename);var obj_tagName=document.getElementById(id_tagname);if(obj_fileName===null||obj_tagName===null){return false}var checkpointNB=wepsim_checkpoint_Obj2NB(checkpointObj);var checkpointStr=JSON.stringify(checkpointNB,null,2);var share_title="WepSIM checkpoint backup";var share_text=checkpointStr;var share_url="";if(obj_tagName.value.toString().trim()!=="")share_title+=" ("+obj_tagName.value+")...";else share_title+="...";return share_information("checkpoint",share_title,share_text,share_url)}function wepsim_checkpoint_backup_load(){var obj_wsbackup=[];try{var json_wsbackup=localStorage.getItem("wepsim_backup");obj_wsbackup=JSON.parse(json_wsbackup)}catch(e){obj_wsbackup=null}if(obj_wsbackup==null){obj_wsbackup=[]}return obj_wsbackup}function wepsim_checkpoint_backup_save(obj_wsbackup){var json_wsbackup=JSON.stringify(obj_wsbackup);localStorage.setItem("wepsim_backup",json_wsbackup);return obj_wsbackup}function wepsim_checkpoint_listCache(id_listdiv){var o='<span style="background-color:#FCFC00">&lt;<span data-langkey="Empty">Empty</span>&gt;</span>';var obj_wsbackup=wepsim_checkpoint_backup_load();if(obj_wsbackup.length==0){$("#"+id_listdiv+"").html(o);return true}o='<div class="btn-group btn-group-toggle list-group m-1" data-toggle="buttons">';obj_wsbackup=obj_wsbackup.reverse();for(i=0;i<obj_wsbackup.length;i++){o+='<label class="list-group-item btn btn-white border-dark text-truncate rounded-sm">'+'   <input type="radio" name="browserCacheElto" id="'+i+'" autocomplete="off">'+obj_wsbackup[i].tag+"</label>"}o+="</div>";$("#"+id_listdiv+"").html(o);return true}function wepsim_checkpoint_loadFromCache(id_filename,id_tagname,id_backupname){var ret={error:true,msg:""};var obj_fileName=document.getElementById(id_filename);var obj_tagName=document.getElementById(id_tagname);if(obj_fileName===null||obj_tagName===null){ret.msg="Invalid arguments";return ret}var browserCacheElto=$("input[name="+id_backupname+"]:checked");if(typeof browserCacheElto[0]==="undefined"){ret.msg="Invalid arguments";return ret}var id_backupcache=browserCacheElto[0].id;var obj_wsbackup=wepsim_checkpoint_backup_load();obj_wsbackup=obj_wsbackup.reverse();var current_checkpoint=obj_wsbackup[id_backupcache];if(typeof current_checkpoint==="undefined"){ret.msg="Backup id is not valid";return ret}var obj_fileToLoad={name:""};wepsim_checkpoint_loadFromObj(current_checkpoint,obj_fileName,obj_tagName,obj_fileToLoad);ret.error=false;ret.msg="Processing load request...";return ret}function wepsim_checkpoint_addCurrentToCache(){var obj_wsbackup=wepsim_checkpoint_backup_load();var current_date=Date().toString();var current_checkpoint=wepsim_checkpoint_get(current_date);if(current_checkpoint.firmware.trim()!==""&&current_checkpoint.assembly.trim()!==""){obj_wsbackup.push(current_checkpoint)}wepsim_checkpoint_backup_save(obj_wsbackup);return true}function wepsim_checkpoint_clearCache(){var obj_wsbackup=[];wepsim_checkpoint_backup_save(obj_wsbackup);return true}function wepsim_update_signal_dialog_title(key){var b_btns=key+": "+"<button onclick=\"$('#bot_signal').carousel(0);\" "+'        type="button" class="btn btn-info">Value</button>'+"<button onclick=\"$('#bot_signal').carousel(1); "+"                 var shval = $('#ask_shard').val(); "+"                 var shkey = $('#ask_skey').val(); "+"                 update_signal_loadhelp('#help2', shval, shkey);\" "+'        type="button" class="btn btn-success">Help</button>';return wepsim_config_dialog_dropdown("success",b_btns,"var shval = $('#ask_shard').val(); "+"var shkey = $('#ask_skey').val(); "+"update_signal_loadhelp('#help2', shval, shkey);\"")}function wepsim_update_signal_dialog_body(key,signal_obj){var checkvalue=signal_obj.value>>>0;var str_bolded="";var str_checked="";var input_help="";var behav_raw="";var behav_str="";var n=0;var nvalues=Math.pow(2,signal_obj.nbits);if(signal_obj.behavior.length==nvalues){input_help='<ol start="0" class="list-group list-group-flush">';for(var k=0;k<signal_obj.behavior.length;k++){str_checked=" ";if(k==checkvalue){str_checked=' checked="checked" '}str_bolded=" ";if(k==signal_obj.default_value){str_bolded='<span class="badge badge-info">default value</span>'}behav_raw=signal_obj.behavior[k];behav_str=compute_signal_verbals(key,k);if(""==behav_str.trim()){behav_str="&lt;without main effect&gt;"}n=k.toString(10);input_help+='<li class="list-group-item p-1">'+'<label class="m-1 btn-like" id="'+key+"_"+n+'">'+'  <input aria-label="value '+n+'" type="radio" name="ask_svalue" '+'         value="'+n+'" '+str_checked+"/>"+'  <span class="badge badge-secondary badge-pill">'+n+"</span>"+"&nbsp;"+"  <span>"+behav_str+"</span>&nbsp;"+str_bolded+'  <p class="m-0 ml-3 bg-light collapse collapse7"><small>'+behav_raw+"</small></p>"+"</label>"+"</li>"}input_help+="</ol>"}else{input_help+='<ol start="0">'+"<span><center><label>"+'<input aria-label="value for '+key+'" type="number" size=4 min=0 max='+(nvalues-1)+" class=dial "+'       name="ask_svalue" value="'+signal_obj.value+'"/>'+"&nbsp;&nbsp;"+" 0 - "+(nvalues-1)+"</center></label></span>\n"+"</ol>"}var curr_hw=simhw_short_name();if(""==curr_hw){curr_hw="ep"}return'<div id="bot_signal" class="carousel" data-ride="carousel" data-interval="false">'+'  <div class="carousel-inner" role="listbox">'+'    <div class="carousel-item active">'+'    <div id="scroller-signal" '+'         style="max-height:70vh; width:inherit; overflow:auto; -webkit-overflow-scrolling:touch;">'+'         <form class="form-horizontal" style="white-space:wrap;">'+'         <input aria-label="value for '+key+'" id="ask_skey"  name="ask_skey"  type="hidden" value="'+key+'" class="form-control input-md"> '+'         <input aria-label="value for '+curr_hw+'" id="ask_shard" name="ask_shard" type="hidden" value="'+curr_hw+'" class="form-control input-md"> '+input_help+"         </form>"+"    </div>"+"    </div>"+'    <div class="carousel-item">'+'         <div id=help2 style="max-height:65vh; width:inherit; overflow:auto; -webkit-overflow-scrolling:touch;">Loading...</div>'+"    </div>"+"  </div>"+"</div>"}function wepsim_update_signal_dialog(key){var signal_obj=simhw_sim_signal(key);if(typeof signal_obj==="undefined"){return null}var dlg_obj={id:"dlg_updatesignal",title:function(){return wepsim_update_signal_dialog_title(key)},body:function(){return wepsim_update_signal_dialog_body(key,signal_obj)},value:signal_obj.value,buttons:{success:{label:'<i class="fas fa-screwdriver"></i> '+'<span data-langkey="Save">Save</span>',className:"btn-info btn-sm col col-md-3 float-right",callback:function(){key=$("#ask_skey").val();user_input=$("input[name='ask_svalue']:checked").val();if(typeof user_input=="undefined"){user_input=$("input[name='ask_svalue']").val()}wepsim_update_signal_with_value(key,user_input);wsweb_dialogbox_close_updatesignal()}},close:{label:'<i class="fa fa-times mr-2"></i>'+'<span data-langkey="Close">Close</span>',className:"btn-primary btn-sm col col-md-3 float-right",callback:function(){wsweb_dialogbox_close_updatesignal()}}},onshow:function(){if(typeof $(".dial").knob!=="undefined"){var nvalues=Math.pow(2,signal_obj.nbits);$(".dial").knob({min:0,max:nvalues-1}).val(signal_obj.value).trigger("change")}var bb=$("#dlg_updatesignal");bb.find(".modal-title").addClass("mx-auto");bb.find(".bootbox-close-button").addClass("mx-1");bb.modal("handleUpdate");wsweb_scroll_record("#scroller-signal");simcore_record_captureInit()},size:"large"};return wsweb_dlg_open(dlg_obj)}function wepsim_update_signal_quick(key){var signal_obj=simhw_sim_signal(key);if(typeof signal_obj==="undefined"){return}var nvalues=Math.pow(2,simhw_sim_signal(key).nbits);var user_input=simhw_sim_signal(key).value;user_input=(user_input+1)%nvalues;wepsim_update_signal_with_value(key,user_input)}function wepsim_update_signal_with_value(key,value){simhw_sim_signal(key).value=value;propage_signal_update(key);simcore_record_append_new("Update signal "+key+" with value "+value,'wepsim_update_signal_with_value("'+key+'", '+value+");\n")}function show_visgraph(jit_fire_dep,jit_fire_order){var sig={};var tmp_hash={};var tmp_nodes=[];var tmp_id=0;for(sig in simhw_sim_signals()){tmp_hash[sig]=tmp_id;tmp_nodes.push({id:tmp_id,label:sig,title:sig});tmp_id++}for(var i=0;i<jit_fire_order.length;i++){tmp_nodes[tmp_hash[jit_fire_order[i]]].color="#7BE141"}var jit_dep_nodes=new vis.DataSet(tmp_nodes);var tmp_edges=[];for(sig in simhw_sim_signals()){for(var sigorg in jit_fire_dep[sig]){tmp_edges.push({from:tmp_hash[sigorg],to:tmp_hash[sig],arrows:"to"})}}var jit_dep_edges=new vis.DataSet(tmp_edges);var jit_dep_container=document.getElementById("depgraph1");var jit_dep_data={nodes:jit_dep_nodes,edges:jit_dep_edges};var jit_dep_options={interaction:{hover:true},height:"255px",nodes:{borderWidth:2,shadow:true},edges:{width:2,shadow:true}};jit_dep_network=new vis.Network(jit_dep_container,jit_dep_data,jit_dep_options)}function wepsim_state_get_clk(){var reg_maddr=get_value(simhw_sim_state("REG_MICROADDR"));var reg_clk=get_value(simhw_sim_state("CLK"));var timestamp=(new Date).getTime();return{time:timestamp,title:"clock "+reg_clk+" @ &#181;address "+reg_maddr,title_short:"clock "+reg_clk+",<br>&#181;add "+reg_maddr}}var state_history=[];function wepsim_state_history_get(){return state_history}function wepsim_state_history_reset(){$("[data-toggle=popover4]").popover("hide");state_history=[]}function wepsim_state_history_add(){var ret=wepsim_state_get_clk();var state_obj=simcore_simstate_current2state();ret.content=simcore_simstate_state2checklist(state_obj);state_history.push(ret)}function wepsim_state_results_empty(){var empty_results='<span style="background-color:#FCFC00">'+"&lt;Empty (only modified values are shown)&gt;"+"</span>";$("#check_results1").html(empty_results);$("#s_clip").html("clipboard");$("#s_ref").html("reference")}function wepsim_state_history_empty(){var empty_history='<div class="pt-2"></div>'+'<span style="background-color:#FCFC00">'+'&lt;<span data-langkey="Empty history">Empty history</span>&gt;'+"</span>";$("#history1").html(empty_history)}function wepsim_state_history_list(){if(0==state_history.length){wepsim_state_history_empty();wepsim_state_results_empty();return}$("[data-toggle=popover4]").popover("hide");var t=0;var it="";var tt="";var vr="";var o="";for(var i=state_history.length-1;i>=0;i--){t=new Date(state_history[i].time);it=t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate()+"-"+t.getHours()+"-"+t.getMinutes()+"-"+t.getSeconds()+"-"+t.getMilliseconds();tt='<div id="popover-content-'+it+'" class="d-none bg-light">'+state_history[i].title+"<br>"+"<b>was inserted at:</b><br>"+"Date: "+t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate()+"<br>"+"Hour: "+t.getHours()+":"+t.getMinutes()+":"+t.getSeconds()+"-"+t.getMilliseconds()+"<br>"+'<button type="button" id="close" data-role="none" '+'        class="btn btn-sm btn-danger w-100 p-0" '+"        onclick=\"$('#"+it+"').popover('hide');\"><span data-langkey=\"Close\">Close</span></button>"+"</div>";vrow="";if(i!=0)vrow='<div class="row h-100"><div class="col border-right border-dark">&nbsp;</div><div class="col">&nbsp;</div></div>';o+='  <div class="row">'+'       <div class="col-auto text-center flex-column d-flex pr-0">'+'              <strong class="m-2">'+'              <span class="badge badge-pill border-secondary border shadow">'+'  \t\t       <a data-toggle="collapse" data-target="#collapse_'+i+'" '+'                       class="col-auto p-0 text-decoration-none text-reset" target="_blank" href="#">'+state_history[i].title_short+"</a>"+"              </span>"+"              </strong>"+vrow+"       </div>"+'       <div class="col py-2 pl-0">'+'             <div class="btn-group float-none" role="group" aria-label="State information for '+it+'">'+'                   <button class="btn btn-outline-dark btn-sm col-auto float-right"'+'                           onclick="wepsim_state_results_empty();  '+"                                    $('#collapse_"+i+"').collapse('show'); "+"                                    wepsim_clipboard_CopyFromDiv('state_"+i+"');  "+"                                    $('#collapse_"+i+"').collapse('hide'); "+"                                    $('#s_clip').html('"+state_history[i].title_short+"'); "+"                                    $('#s_ref').html('reference'); \" "+'                           type="button"><span data-langkey="Copy">Copy</span><span class="d-none d-sm-inline-flex">&nbsp;<span data-langkey="to clipboard">to clipboard</span></span></button>'+'                   <button class="btn btn-outline-dark btn-sm col-auto float-right"'+'                           onclick="var txt_chklst1 = get_clipboard_copy();'+"                                    var obj_exp1    = simcore_simstate_checklist2state(txt_chklst1);"+"                                    var txt_chklst2 = $('#ta_state_"+i+"').val();"+"                                    var obj_exp2    = simcore_simstate_checklist2state(txt_chklst2);"+"                                    wepsim_dialog_check_state(obj_exp1, obj_exp2);"+"                                    $('#s_ref').html('"+state_history[i].title_short+"'); "+"                                    $('#check_results_scroll1').collapse('show');\""+'                           type="button"><span data-langkey="Check">Check</span> <span class="d-none d-md-inline-flex">differences with clipboard state</span></button>'+'                   <button class="btn btn-outline-dark btn-sm col-auto float-right"'+'  \t\t              data-toggle="collapse" data-target="#collapse_'+i+'">&plusmn; <span data-langkey="Show">Show</span></button>'+"             </div>"+tt+'             <div id="collapse_'+i+'" class="border border-secondary mt-2 collapse">'+'                   <div class="card-body p-1 small" '+'                        id="state_'+i+'">'+state_history[i].content+"</div>"+'                   <textarea aria-label="hidden-state"  style="display:none"'+'                             id="ta_state_'+i+'" readonly>'+state_history[i].content+"</textarea>"+"             </div>"+"       </div>"+"  </div>"}$("#history1").html(o);wepsim_state_results_empty();$("[data-toggle=popover4]").popover({html:true,placement:"auto",trigger:"click",container:"body",animation:false,content:function(){var id=$(this).attr("id");return $("#popover-content-"+id).html()},sanitizeFn:function(content){return content}})}function wepsim_dialog_current_state(){var ret=wepsim_state_get_clk();$("#curr_clk_maddr").html(ret.title_short);var state_obj=simcore_simstate_current2state();var txt_checklist=simcore_simstate_state2checklist(state_obj);$("#end_state1").tokenfield("setTokens",txt_checklist);wepsim_notify_success("<strong>INFO</strong>","Current state loaded !");var neltos=0;var nceltos=0;var ga_str="";for(var component in state_obj){nceltos=0;for(var eltos in state_obj[component]){nceltos++}ga_str=ga_str+","+component+"="+nceltos;neltos=neltos+nceltos}ga("send","event","state","state.dump","state.dump"+".ci="+get_value(simhw_sim_state("REG_IR_DECO"))+",neltos="+neltos+ga_str)}function wepsim_dialog_check_state(obj_chklst_expected,obj_chklst_current){var obj_result=simcore_simstate_diff_results(obj_chklst_expected,obj_chklst_current);var msg="";if(0==obj_result.errors)msg="&emsp;<br><span style='background-color:#7CFC00'>"+"<span data-langkey='Meets the specified requirements'>Meets the specified requirements</span>"+"</span><br>";else msg=simcore_simstate_checkreport2html(obj_result.result,true);$("#check_results1").html(msg);ga("send","event","state","state.check","state.check"+",ci="+get_value(simhw_sim_state("REG_IR_DECO"))+".a="+obj_result.neltos_expected+",b="+obj_result.neltos_obtained+",sd="+obj_result.errors);return true}function wepsim_dialog_check_reset(){$("#end_state1").val("");$("#end_state1").tokenfield("setTokens",[]);$("#check_results1").html("");return true}function wepsim_execute_reset(reset_cpu,reset_memory){wepsim_state_history_reset();if(true===reset_memory){var SIMWARE=get_simware();if(SIMWARE.firmware.length!==0)update_memories(SIMWARE)}if(true===reset_cpu){simcore_reset()}}function wepsim_execute_instruction(){var ret=simcore_check_if_can_execute();if(false===ret.ok){wsweb_dlg_alert(ret.msg);return false}var options={verbosity:0,cycles_limit:get_cfg("DBG_limitick")};ret=simcore_execute_microprogram(options);if(false===ret.ok){wepsim_show_stopbyevent("Info",ret.msg);return false}return true}function wepsim_execute_microinstruction(){var ret=simcore_check_if_can_execute();if(false===ret.ok){wsweb_dlg_alert(ret.msg);return false}ret=simcore_execute_microinstruction();if(false===ret.ok){wepsim_show_stopbyevent("Info",ret.msg);return false}return true}function wepsim_execute_set_breakpoint(hexaddr,is_set){var curr_firm=simhw_internalState("FIRMWARE");curr_firm.assembly[hexaddr].breakpoint=is_set;return true}var DBG_stop=true;var DBG_limit_instruction=0;function wepsim_execute_stop(btn1){var wsi=get_cfg("ws_idiom");var run_tag=i18n_get("gui",wsi,"Run");$(btn1).html("<i class='fa fa-play'></i><br><b>"+run_tag+"</b>");$(btn1).css("backgroundColor","#CCCCCC");DBG_stop=true;DBG_limit_instruction=0}function wepsim_execute_play(btn1){var wsi=get_cfg("ws_idiom");var stop_tag=i18n_get("gui",wsi,"Stop");var ret=simcore_check_if_can_execute();if(false===ret.ok){wsweb_dlg_alert(ret.msg);return false}$(btn1).css("backgroundColor","rgb(51, 136, 204)");$(btn1).html("<i class='fa fa-stop'></i><br><b>"+stop_tag+"</b>");DBG_stop=false;DBG_limit_instruction=0;wepsim_execute_chainplay(btn1)}function wepsim_execute_toggle_play(btn1){if(DBG_stop===false){DBG_stop=true}else{wepsim_execute_play(btn1)}}function wepsim_check_stopbybreakpoint_firm(reg_maddr){var dash_maddr=simhw_internalState_get("MC_dashboard",reg_maddr);if(typeof dash_maddr==="undefined"){return false}return dash_maddr.breakpoint}function wepsim_check_stopbybreakpoint_asm(curr_firm,reg_pc){var curr_addr="0x"+reg_pc.toString(16);if(typeof curr_firm.assembly[curr_addr]==="undefined"){return false}return curr_firm.assembly[curr_addr].breakpoint}function wepsim_show_stopbyevent(msg1,msg2){var dlg_obj={id:"current_state2",title:function(){var maddr_name=simhw_sim_ctrlStates_get().mpc.state;var reg_maddr=get_value(simhw_sim_state(maddr_name));var curr_maddr="0x"+reg_maddr.toString(16);var pc_name=simhw_sim_ctrlStates_get().pc.state;var reg_pc=get_value(simhw_sim_state(pc_name));var curr_addr="0x"+reg_pc.toString(16);var dialog_title=msg1+" @ pc="+curr_addr+"+mpc="+curr_maddr;return'<span id="dlg_title2">'+dialog_title+"</span>"},body:function(){return'<div class="card card-info border-light m-2">'+'<div class="card-body">'+'     <div class="row"> '+'\t  <div class="col-auto">'+'\t       <em class="fas fa-comment-alt"></em>'+"\t  </div>"+'\t  <div class="col">'+'\t       <h5><span id="dlg_body2">'+msg2+"</span></h5>"+"\t  </div>"+"     </div>"+"</div>"+"</div>"},buttons:{states:{label:"<span data-langkey='States'>States</span>",className:"btn btn-secondary col float-left shadow-none mr-auto",callback:function(){wsweb_dlg_close(dlg_obj);wsweb_dialog_open("state");return true}},close:{label:"<span data-langkey='Close'>Close</span>",className:"btn-primary col float-right shadow-none"}},size:"",onshow:function(){}};wsweb_dlg_open(dlg_obj);return true}function wepsim_check_mcdashboard(btn1,reg_maddr){var ref_mcdash=simhw_internalState_get("MC_dashboard",reg_maddr);if(typeof ref_mcdash==="undefined"){return true}if(ref_mcdash.state){wepsim_state_history_add();wepsim_state_history_list()}var notifications=ref_mcdash.notify.length;if(notifications>1){var dialog_title="Notify @ "+reg_maddr+": "+ref_mcdash.notify[1];var dialog_msg='<div style="max-height:70vh; width:inherit; overflow:auto; -webkit-overflow-scrolling:touch;">';for(var k=1;k<notifications;k++){dialog_msg+=ref_mcdash.notify[k]+"\n<br>"}dialog_msg+="</div>";bootbox.confirm({title:dialog_title,message:dialog_msg,buttons:{cancel:{label:"Stop",className:"btn-danger  btn-sm"},confirm:{label:"Continue",className:"btn-primary btn-sm"}},callback:function(result){if(result)setTimeout(wepsim_execute_chainplay,get_cfg("DBG_delay"),btn1);else wepsim_execute_stop(btn1)}});return false}return true}function wepsim_execute_chunk(btn1,chunk){var options={verbosity:0,cycles_limit:get_cfg("DBG_limitick")};var curr_firm=simhw_internalState("FIRMWARE");var pc_name=simhw_sim_ctrlStates_get().pc.state;var ref_pc=simhw_sim_state(pc_name);var reg_pc=get_value(ref_pc);var maddr_name=simhw_sim_ctrlStates_get().mpc.state;var ref_maddr=simhw_sim_state(maddr_name);var reg_maddr=get_value(ref_maddr);var ret=false;var i_clks=0;var i=0;while(i<chunk){ret=simcore_execute_microinstruction2(reg_maddr,reg_pc);if(false===ret.ok){wepsim_show_stopbyevent("Info",ret.msg);wepsim_execute_stop(btn1);return false}i_clks++;if(options.cycles_limit>0&&i_clks>=options.cycles_limit){wepsim_show_stopbyevent("Info","Warning: clock cycles limit reached in a single instruction.");wepsim_execute_stop(btn1);return false}reg_maddr=get_value(ref_maddr);reg_pc=get_value(ref_pc);ret=wepsim_check_mcdashboard(btn1,reg_maddr);if(false===ret){return false}ret=wepsim_check_stopbybreakpoint_firm(reg_maddr);if(true===ret){wepsim_show_stopbyevent("Breakpoint","Microinstruction is going to be issue.");wepsim_execute_stop(btn1);return false}if(0===reg_maddr){ret=wepsim_check_stopbybreakpoint_asm(curr_firm,reg_pc);if(true===ret){wepsim_show_stopbyevent("Breakpoint","Instruction is going to be fetched.");wepsim_execute_stop(btn1);return false}i++;i_clks=0}}return true}function wepsim_execute_chunk_atlevel(btn1,chunk){var playlevel=get_cfg("DBG_level");if(playlevel!=="instruction"){return wepsim_execute_chunk(btn1,chunk)}var curr_firm=simhw_internalState("FIRMWARE");var pc_name=simhw_sim_ctrlStates_get().pc.state;var ref_pc=simhw_sim_state(pc_name);var maddr_name=simhw_sim_ctrlStates_get().mpc.state;var ref_maddr=simhw_sim_state(maddr_name);var options={verbosity:0,cycles_limit:get_cfg("DBG_limitick")};var ret=false;var reg_pc=0;for(var i=0;i<chunk;i++){ret=simcore_execute_microprogram(options);if(ret.ok===false){wepsim_show_stopbyevent("Info",ret.msg);wepsim_execute_stop(btn1);return false}reg_pc=get_value(ref_pc);ret=wepsim_check_stopbybreakpoint_asm(curr_firm,reg_pc);if(true===ret){wepsim_show_stopbyevent("Breakpoint","Instruction is going to be fetched.");wepsim_execute_stop(btn1);return false}}return true}var max_turbo=5;function wepsim_reset_max_turbo(){max_turbo=5}function wepsim_execute_chainplay(btn1){var t0=1;var t1=1;if(DBG_stop){wepsim_execute_stop(btn1);return}var turbo=1;if(get_cfg("DBG_delay")<5)turbo=max_turbo;if(max_turbo===5)t0=performance.now();var ret=wepsim_execute_chunk(btn1,turbo);if(false===ret){return}if(max_turbo===5){t1=performance.now()}if(max_turbo===5){max_turbo=3e3/(t1-t0)}DBG_limit_instruction+=turbo;if(DBG_limit_instruction>get_cfg("DBG_limitins")){wepsim_show_stopbyevent("Limit","Number of executed instructions limit reached.<br>"+"<br>"+"See related configuration options about limits:<br>"+"<img height='100vw' src='./images/simulator/simulator018.jpg'>");wepsim_execute_stop(btn1);return}setTimeout(wepsim_execute_chainplay,get_cfg("DBG_delay"),btn1)}function wepsim_notify_show_notify(ntf_title,ntf_message,ntf_type,ntf_delay){var ac=$("#alerts-container");if(ac.length===0){ac=$('<div id="alerts-container" '+'     class="col-10 offset-xs-1  col-md-8 offset-md-2  col-lg-6 offset-lg-3" '+'     style="position:fixed; top:10%; z-index:256;">');$("body").append(ac)}var btn1=$('<button type="button" class="close" onclick="wepsim_notify_close(); return false;">');var alert1=$('<div class="alert alert-'+ntf_type+' shadow border border-light">');ac.prepend(alert1.append(btn1.append("&times;")).append(ntf_message));if(ntf_delay!=0){window.setTimeout((function(){alert1.alert("close")}),ntf_delay)}var msg="Notification type "+ntf_type+" and title "+ntf_title+":"+ntf_message+". ";msg=$("</p>").html(msg).text();simcore_voice_speak(msg)}function wepsim_notify_do_notify(ntf_title,ntf_message,ntf_type,ntf_delay){simcore_notifications_add(ntf_title,ntf_message,ntf_type,ntf_delay);wepsim_notify_show_notify(ntf_title,ntf_message,ntf_type,ntf_delay)}function wepsim_notify_success(ntf_title,ntf_message){return wepsim_notify_do_notify(ntf_title,ntf_message,"success",get_cfg("NOTIF_delay"))}function wepsim_notify_error(ntf_title,ntf_message){return wepsim_notify_do_notify(ntf_title,ntf_message,"danger",0)}function wepsim_notify_warning(ntf_title,ntf_message){return wepsim_notify_do_notify(ntf_title,ntf_message,"warning",get_cfg("NOTIF_delay"))}function wepsim_notify_close(){$(".alert").alert("close");simcore_record_append_new("Close all notifications","wepsim_notify_close();\n")}function table_notifications_html(notifications){var u="";var t=null;var m="";for(var i=notifications.length-1;i!=-1;i--){t=new Date(notifications[i].date);m=notifications[i].message.replace(/\n/g,"<br>\n");u+='<li class="list-group-item list-group-item-'+notifications[i].type+' rounded-lg mx-2 my-1 p-2 shadow-sm">'+'<h5 class="m-0 collapse7 show">'+'<span class="badge">('+t.getHours()+":"+t.getMinutes()+":"+t.getSeconds()+"."+t.getMilliseconds()+")</span>"+'<span class="badge">['+t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate()+"]</span>"+"</h5>"+'<span class="text-monospace">'+notifications[i].title+":"+"</span>"+m+"</li>"}if(u.trim()===""){u='<p class="m-3 text-center py-4"><b>&lt;Empty&gt;</b></p>'}var o='<div id="container-notifications3" class="card border-white" '+'     style="max-height:50vh; overflow:auto; -webkit-overflow-scrolling: touch;">'+'<ul class="list-group list-group-flush">'+u+"</ul>"+"</div>";return o}var ws_modes=["newbie","intro","asm_mips","asm_rv32","asm_z80"];var ws_default_example={asm_mips:"ep:ep_mips:ep_s4_e1",asm_rv32:"ep:ep_rv32:ep_s7_e2",asm_z80:"ep:ep_z80:ep_s7_e3"};function wepsim_mode_getAvailableModes(){return ws_modes}function wepsim_mode_change(optValue){var hwid=-1;if(ws_modes.includes(optValue))hwid=simhw_getIdByName("ep");else hwid=simhw_getIdByName(optValue);if(hwid!=-1){wepsim_activehw(hwid)}wepsim_activeview("only_asm",false);if(optValue.startsWith("asm_")){wepsim_activeview("only_asm",true);load_from_example_firmware(ws_default_example[optValue],false)}if("intro"==optValue){wsweb_recordbar_show();wepsim_checkpoint_loadExample("tutorial_2.txt");return true}if("newbie"==optValue){wepsim_newbie_tour();return true}return true}function share_information(info_shared,share_title,share_text,share_url){if(typeof navigator.share==="undefined"){var msg="Sorry, unable to share:<br>\n"+"navigator.share is not available.<br>"+"<br>"+'<div id="qrcode1" class="mx-auto"></div>'+"<br>";wsweb_dlg_alert(msg);var qrcode=new QRCode("qrcode1");qrcode.makeCode(share_url);return false}var data={};data.title=share_title;data.text=share_text;data.url=share_url;try{navigator.share(data)}catch(err){wsweb_dlg_alert("Sorry, unsuccessful share: "+err.message)}ga("send","event","ui","ui.share","ui.share."+info_shared);return true}function wsweb_dlg_open(dialog_obj){if(typeof dialog_obj!=="object"){return null}var ext_dlg_obj={title:dialog_obj.title(),message:dialog_obj.body(),value:dialog_obj.value,scrollable:true,size:dialog_obj.size,centerVertical:true,keyboard:true,animate:false,onShow:function(){dialog_obj.onshow();var ws_idiom=get_cfg("ws_idiom");i18n_update_tags("dialogs",ws_idiom);i18n_update_tags("gui",ws_idiom)},buttons:dialog_obj.buttons};var d1=bootbox.dialog(ext_dlg_obj);d1.init((function(){d1.attr("id",dialog_obj.id)}));d1.one("hidden.bs.modal",(function(){wsweb_dialog_close(dialog_obj)}));d1.find(".modal-title").addClass("ml-auto");d1.modal("handleUpdate");d1.modal("show");return d1}function wsweb_dlg_close(dialog_obj){if(typeof dialog_obj!=="object"){return null}var d1=$("#"+dialog_obj.id);d1.modal("hide");return d1}function wsweb_dlg_alert(msg){var a_obj={title:'<i class="fas fa-exclamation"></i> '+'<span data-langkey="Alert">Alert</span>',message:'<div class="p-2">'+msg+"</div>",scrollable:true,centerVertical:true,keyboard:true,animate:false,buttons:{cancel:{label:'<i class="fa fa-times mr-2"></i>'+'<span data-langkey="Close">Close</span>',className:"btn btn-primary btn-sm "+"col col-sm-3 float-right shadow-none"}},size:""};var d1=bootbox.dialog(a_obj);d1.find(".modal-title").addClass("ml-auto");d1.modal("handleUpdate");d1.modal("show");return d1}function table_config_html(config){var e_type="";var e_u_class="";var e_code_cfg="";var e_description="";var e_id="";var fmt_toggle="";var fmt_header="";var row="";var config_groupby_type={};for(var n=0;n<config.length;n++){e_type=config[n].type;e_u_class=config[n].u_class;e_code_cfg=config[n].code_cfg;e_description=config[n].description;e_id=config[n].id;if(fmt_toggle==="")fmt_toggle="bg-light";else fmt_toggle="";row='<div class="row py-1 '+fmt_toggle+" "+e_u_class+'" id="'+e_type+'">'+'<div class="col-md-auto">'+'    <span class="badge badge-pill badge-light">'+(n+1)+"</span>"+"</div>"+'<div class="col-md-4">'+e_code_cfg+"</div>"+'<div class="col-md collapse7 show align-items-center"><c>'+e_description+"</c></div>"+"</div>";if(typeof config_groupby_type[e_type]==="undefined"){config_groupby_type[e_type]=[]}config_groupby_type[e_type].push({row:row,u_class:e_u_class})}var o='<div class="container grid-striped border border-light">';var u="";var l="";var l1=[];var l2={};for(var m in config_groupby_type){u="";l2={};for(n=0;n<config_groupby_type[m].length;n++){u=u+config_groupby_type[m][n].row;l1=config_groupby_type[m][n].u_class.split(" ");for(var li=0;li<l1.length;li++){if(typeof l2[l1[li]]==="undefined"){l2[l1[li]]=0}l2[l1[li]]++}}l="";for(var lj in l2){if(l2[lj]===config_groupby_type[m].length){l+=lj+" "}}o=o+"<div class='float-none text-right text-capitalize font-weight-bold col-12 border-bottom border-secondary bg-white sticky-top "+l+"'>"+"<span data-langkey='"+m+"'>"+m+"</span>"+"</div>"+u}o=o+"</div>";return o}function wepsim_show_breakpoint_icon_list(){var o="<div class='container' style='max-height:65vh; overflow:auto; -webkit-overflow-scrolling:touch;'>"+"<div class='row'>";var prev_type="";for(var elto in breakpoint_icon_list){if(breakpoint_icon_list[elto].type!=prev_type){o=o+"</div>"+"<div class='row p-1'>"+"<div class='float-none text-left text-capitalize font-weight-bold col-12 border-bottom border-secondary'>"+breakpoint_icon_list[elto].type+"</div>"+"</div>"+"<div class='row'>";prev_type=breakpoint_icon_list[elto].type}o=o+"<img src='images/stop/stop_"+elto+".gif' alt='"+elto+" icon' "+"     class='img-thumbnail col-3 mx-2 d-block "+breakpoint_icon_list[elto].addclass+"'"+"     style='height:6vh; min-height:30px;'"+"     onclick=\"$('#img_select1').attr('src',        'images/stop/stop_"+elto+".gif');"+"               $('#img_select1').attr('class',      '"+breakpoint_icon_list[elto].addclass+"');"+"               $('#img_select1').attr('data-theme', '');"+"\t        set_cfg('ICON_theme','"+elto+"'); save_cfg();"+"               $('#breakpointicon1').popover('hide');"+'               wepsim_uicfg_apply();">'}o=o+"</div>"+"</div>";return o}function wepsim_show_breakpoint_icon_template(){var o='<div class="popover" role="tooltip">'+'<div class="arrow"></div><h3 class="popover-header"></h3>'+'<div class="popover-body"></div>'+'<div class="popover-footer">'+'  <div class="m-0 p-2" style="background-color: #f7f7f7">'+'  <button type="button" id="close" data-role="none" '+'          class="btn btn-sm btn-danger w-100 p-0" '+"          onclick=\"$('#breakpointicon1').popover('hide');\"><span data-langkey=\"Close\">Close</span></button>"+"  </div>"+"</div>"+"</div>";return o}function wepsim_config_dialog_title(name,color,str_onchange){return"<div class='dropdown btn-group'>"+"<button type='button' "+"   class='btn btn-outline-"+color+" px-3 py-1 dropdown-toggle' "+"   data-toggle='dropdown' id='dropdown-title1' "+"   aria-expanded='false' aria-haspopup='true'>"+"<span class='font-weight-bold' data-langkey='"+name+"'>"+name+"</span>"+"</button>"+"<div class='dropdown-menu' "+"     style='overflow-y:auto; max-height:55vh; z-index:100000;' "+"     aria-labelledby='dropdown-title1'>"+" <form class='px-3 m-0'><div class='form-group m-0'>"+" <label for='wsdt"+name+"'>details</label>"+" <button class='btn btn-outline-secondary btn-block py-1' "+"         type='button' id='wsdt"+name+"' "+'         onclick=\'$(".collapse7").collapse("toggle");\'>'+" <span class='text-truncate'>&plusmn; Description</span>"+" </button>"+" </div></form>"+"<div class='dropdown-divider m-1'></div>"+" <form class='px-3 m-0'><div class='form-group m-0'>"+" <label for='dd2'>idiom</label>"+i18n_get_select("select7b"+name,str_onchange)+" </div></form>"+"</div>"+"</div>"}function wepsim_config_dialog_dropdown(color,base_buttons,str_onchange){return"<div class='dropdown btn-group'>"+base_buttons+"<button type='button' "+"   data-toggle='dropdown' id='dropdown-title1' "+"   aria-expanded='false' aria-haspopup='true' "+"   class='btn btn-"+color+" dropdown-toggle dropdown-toggle-split'"+"><span class='sr-only'>Toggle Dropdown</span>"+"</button>"+"<div class='dropdown-menu' "+"     style='overflow-y:auto; max-height:55vh; z-index:100000;' "+"     aria-labelledby='dropdown-title1'>"+" <form class='px-3 m-0'><div class='form-group m-0'>"+" <label for='wsdt"+name+"'>details</label>"+" <button class='btn btn-outline-secondary btn-block py-1' "+"         type='button' id='wsdt"+name+"' "+'         onclick=\'$(".collapse7").collapse("toggle");\'>'+" <span>&plusmn; Description</span>"+" </button>"+" </div></form>"+"<div class='dropdown-divider m-1'></div>"+" <form class='px-3 m-0'><div class='form-group m-0'>"+" <label for='dd2'>idiom</label>"+i18n_get_select("select7b"+name,str_onchange)+" </div></form>"+"</div>"+"</div>"}var ws_config=[];ws_config.push({id:"select7",type:"General",u_class:"",code_cfg:"<div class='form-group m-0'>"+i18n_get_selectcfg()+"</div>",code_init:function(){$("#select7").val(get_cfg("ws_idiom"))},description:"<span data-langkey='Idiom for help, examples, etc.'>Idiom for help, examples, etc.</span>"});ws_config.push({id:"slider3",type:"General",u_class:"",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label8-2000'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Notification delay: slow'"+"\t\t   onclick=\"update_cfg('NOTIF_delay', 2000);\">"+"\t\t<input type='radio' name='options' id='radio8-2000'   autocomplete='off' ><span data-langkey='Slow'>Slow</span>"+"\t    </label>"+"\t    <label id='label8-1000'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Notification delay: normal'"+"\t\t   onclick=\"update_cfg('NOTIF_delay', 1000);\">"+"\t\t<input type='radio' name='options' id='radio8-1000'  autocomplete='off' ><span data-langkey='Normal'>Normal</span>"+"\t    </label>"+"\t    <label id='label8-100'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Notification delay: fast'"+"\t\t   onclick=\"update_cfg('NOTIF_delay', 100);\">"+"\t\t<input type='radio' name='options' id='radio8-100'  autocomplete='off' ><span data-langkey='Fast'>Fast</span>"+"\t    </label>"+"\t</div>",code_init:function(){$("#label8-"+get_cfg("NOTIF_delay")).button("toggle")},description:"<span data-langkey='Notification speed: time before disapear'>Notification speed: time before disapear</span>"});ws_config.push({id:"radio15",type:"General",u_class:"",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label15-true'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' "+"               aria-label='WepSIM dark mode: true' "+'\t\t   onclick="wepsim_restore_darkmode(true) ; '+"\t\t             update_cfg('ws_skin_dark_mode', true);"+'\t\t             return false;">'+"\t\t<input type='radio' name='options' id='radio15-true'  aria-label='Dark mode: true'  autocomplete='off' >On"+"\t    </label>"+"\t    <label id='label15-false'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' "+"               aria-label='WepSIM dark mode: true' "+'\t\t   onclick="wepsim_restore_darkmode(false) ; '+"\t\t             update_cfg('ws_skin_dark_mode', false);"+'\t\t             return false;">'+"\t\t<input type='radio' name='options' id='radio15-false' aria-label='Dark mode: false' autocomplete='off' >Off"+"\t    </label>"+"\t</div>",code_init:function(){var optValue=get_cfg("ws_skin_dark_mode");$("#label15-"+optValue).button("toggle");wepsim_restore_darkmode(optValue)},description:"<span data-langkey='Dark Mode'>Dark Mode</span>"});ws_config.push({id:"radio12",type:"Execution",u_class:"",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label12-50'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Speed: slow'"+"\t\t   onclick=\"update_cfg('DBG_delay', 50);\">"+"\t\t<input type='radio' name='options' id='radio12-50'   autocomplete='off' ><span data-langkey='Slow'>Slow</span>"+"\t    </label>"+"\t    <label id='label12-5'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Speed: normal'"+"\t\t   onclick=\"update_cfg('DBG_delay', 5);\">"+"\t\t<input type='radio' name='options' id='radio12-5'  autocomplete='off' ><span data-langkey='Normal'>Normal</span>"+"\t    </label>"+"\t    <label id='label12-1'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Speed: fast'"+"\t\t   onclick=\"update_cfg('DBG_delay', 1);\">"+"\t\t<input type='radio' name='options' id='radio12-1'  autocomplete='off' ><span data-langkey='Fast'>Fast</span>"+"\t    </label>"+"\t</div>",code_init:function(){$("#label12-"+get_cfg("DBG_delay")).button("toggle")},description:"<span data-langkey='Running speed: execution speed'>Running speed: execution speed</span>"});ws_config.push({id:"select1",type:"Execution",u_class:"",code_cfg:"<a href='#' id='breakpointicon1' title='Please select breakpoint icon' tabindex='0'"+"   data-toggle='popover' data-trigger='click'>"+"   \t\t<img alt='stop icon' id='img_select1' src='images/stop/stop_classic.gif' class='' "+"                 style='position:relative; left:10px; height:30px !important; width:30px !important;'>"+"</a>",code_init:function(){var elto=get_cfg("ICON_theme");$("#img_select1").attr("src","images/stop/stop_"+elto+".gif");$("#img_select1").attr("class",breakpoint_icon_list[elto].addclass);$("#breakpointicon1").popover({html:true,content:wepsim_show_breakpoint_icon_list,template:wepsim_show_breakpoint_icon_template(),sanitizeFn:function(content){return content}}).on("shown.bs.popover",(function(shownEvent){wepsim_uicfg_apply()}))},description:"<span data-langkey='Breakpoint icon: icon to be used for breakpoints'>Breakpoint icon: icon to be used for breakpoints</span>"});ws_config.push({id:"select6",type:"Execution",u_class:"",code_cfg:" <div class='form-group m-0'>"+"\t    <select name='select6' id='select6' class='form-control form-control-sm custom-select'"+"\t\t    aria-label='max. ticks per instruction' "+"\t\t    onchange=\"var opt = $(this).find('option:selected');"+"\t\t\t       var optValue = opt.val();"+"\t\t\t       update_cfg('DBG_limitins',optValue);\""+"\t\t    data-native-menu='false'>"+"\t\t<option value='-1'>without limit</option>"+"\t\t<option value='500'  >500</option>"+"\t\t<option value='1000' >1000</option>"+"\t\t<option value='2000' >2000</option>"+"\t\t<option value='10000'>10000</option>"+"\t\t<option value='50000'>50000</option>"+"\t    </select>"+"\t </div>",code_init:function(){$("#select6").val(get_cfg("DBG_limitins"))},description:"<span data-langkey='Limit instructions: number of instructions to be executed'>Limit instructions: number of instructions to be executed</span>"});ws_config.push({id:"select3",type:"Execution",u_class:"",code_cfg:" <div class='form-group m-0'>"+"\t    <select name='select3' id='select3' class='form-control form-control-sm custom-select'"+"\t\t    aria-label='max. ticks per instruction' "+"\t\t    onchange=\"var opt = $(this).find('option:selected');"+"\t\t\t       var optValue = opt.val();"+"\t\t\t       update_cfg('DBG_limitick',optValue);\""+"\t\t    data-native-menu='false'>"+"\t\t<option value='-1'>without limit</option>"+"\t\t<option value='500'  >500</option>"+"\t\t<option value='1000' >1000</option>"+"\t\t<option value='2000' >2000</option>"+"\t\t<option value='10000'>10000</option>"+"\t\t<option value='50000'>50000</option>"+"\t    </select>"+"\t </div>",code_init:function(){$("#select3").val(get_cfg("DBG_limitick"))},description:"<span data-langkey='Limit instruction ticks: to limit clock ticks'>Limit instruction ticks: to limit clock ticks</span>"});ws_config.push({id:"radio7",type:"Editor",u_class:"",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label7-default'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;' "+"\t\t   onclick=\"update_cfg('editor_theme','default');"+"\t\t\t     sim_cfg_editor_theme(inputfirm) ;"+'\t\t\t     sim_cfg_editor_theme(inputasm) ;">'+"\t\t<input type='radio' name='options' id='radio7-default' aria-label='Editor theme: light' autocomplete='off' ><span data-langkey='Light'>Light</span>"+"\t    </label>"+"\t    <label id='label7-blackboard'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;' "+"\t\t   onclick=\"update_cfg('editor_theme','blackboard');"+"\t\t\t     sim_cfg_editor_theme(inputfirm) ;"+'\t\t\t     sim_cfg_editor_theme(inputasm) ;">'+"\t\t<input type='radio' name='options' id='radio7-blackboard' aria-label='Editor theme: dark' autocomplete='off' ><span data-langkey='Dark'>Dark</span>"+"\t    </label>"+"\t</div>",code_init:function(){$("#label7-"+get_cfg("editor_theme")).button("toggle")},description:"<span data-langkey='Editor theme: light or dark'>Editor theme: light or dark</span>"});ws_config.push({id:"select2",type:"Editor",u_class:"",code_cfg:"<div class='form-group m-0'>"+"   <select name='select2' id='select2' class='form-control form-control-sm custom-select'"+"\t    aria-label='Editor mode'    "+"\t    onchange=\"var opt = $(this).find('option:selected');"+"\t\t      var optValue = opt.val();"+"\t\t      update_cfg('editor_mode',optValue);"+"\t\t      sim_cfg_editor_mode(inputfirm);"+'\t\t      sim_cfg_editor_mode(inputasm);"'+"\t    data-native-menu='false'>"+"\t<option value='default'>default</option>"+"\t<option value='vim'>VIM</option>"+"\t<option value='emacs'>Emacs</option>"+"\t<option value='sublime'>Sublime</option>"+"    </select>"+"</div>",code_init:function(){$("#select2").val(get_cfg("editor_mode"))},description:"<span data-langkey='Editor mode: vim, emacs, etc.'>Editor mode: vim, emacs, etc.</span>"});ws_config.push({id:"radio2",type:"Register file",u_class:"user_archived",code_cfg:"    <div class='btn-group-toggle' data-toggle='buttons' >"+"    <div class='btn-group d-flex btn-group-justified'>"+"\t    <label id='label2-unsigned_16_nofill'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='register file display format: hexadecimal'"+"\t\t   onclick=\"update_cfg('RF_display_format','unsigned_16_nofill'); show_rf_values(); show_states(); show_memories_values();\">"+"\t\t<input type='radio' name='options' id='radio2-unsigned_16_nofill'  autocomplete='off' >1A<sub>16</sub>"+"\t    </label>"+"\t    <label id='label2-unsigned_10_nofill'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='register file display format: decimal'"+"\t\t   onclick=\"update_cfg('RF_display_format','unsigned_10_nofill'); show_rf_values(); show_states(); show_memories_values();\">"+"\t\t<input type='radio' name='options' id='radio2-unsigned_10_nofill'  autocomplete='off' >32<sub>10</sub>"+"\t    </label>"+"\t    <label id='label2-unsigned_8_nofill'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='register file display format: octal'"+"\t\t   onclick=\"update_cfg('RF_display_format','unsigned_8_nofill');  show_rf_values(); show_states(); show_memories_values();\">"+"\t\t<input type='radio' name='options' id='radio2-unsigned_8_nofill'   autocomplete='off' >26<sub>8</sub>"+"\t    </label>"+"    </div>"+"    <div class='btn-group d-flex btn-group-justified'>"+"\t    <label id='label2-unsigned_16_fill'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='register file display format: hexadecimal'"+"\t\t   onclick=\"update_cfg('RF_display_format','unsigned_16_fill'); show_rf_values(); show_states(); show_memories_values();\">"+"\t\t<input type='radio' name='options' id='radio2-unsigned_16_fill'  autocomplete='off' >001A<sub>16</sub>"+"\t    </label>"+"\t    <label id='label2-unsigned_10_fill'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='register file display format: decimal'"+"\t\t   onclick=\"update_cfg('RF_display_format','unsigned_10_fill'); show_rf_values(); show_states(); show_memories_values();\">"+"\t\t<input type='radio' name='options' id='radio2-unsigned_10_fill'  autocomplete='off' >0032<sub>10</sub>"+"\t    </label>"+"\t    <label id='label2-unsigned_8_fill'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='register file display format: octal'"+"\t\t   onclick=\"update_cfg('RF_display_format','unsigned_8_fill');  show_rf_values(); show_states(); show_memories_values();\">"+"\t\t<input type='radio' name='options' id='radio2-unsigned_8_fill'   autocomplete='off' >0026<sub>8</sub>"+"\t    </label>"+"    </div>"+"\t</div>",code_init:function(){$("#label2-"+get_cfg("RF_display_format")).button("toggle")},description:"<span data-langkey='Display format'>Display format</span>&nbsp;"+"<a href='#' data-toggle='popover1' title='Example of display formats' data-html='true' "+'   data-content=\'<img alt="register file example" src="images/cfg-rf.gif" class="img-fluid">\'><span <span data-langkey=\'(example)\'>(example)</span></a>'});ws_config.push({id:"radio3",type:"Register file",u_class:"user_archived",code_cfg:" <div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label3-numerical'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='register file display name (number)'"+"\t\t   onclick=\"update_cfg('RF_display_name','numerical'); wepsim_show_rf_names();\">"+"\t\t<input type='radio' name='options' id='radio3-numerical'  autocomplete='off' ><span data-langkey='Numbers'>Numbers</span>"+"\t    </label>"+"\t    <label id='label3-logical'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='register file display name (user identification)'"+"\t\t   onclick=\"update_cfg('RF_display_name','logical'); wepsim_show_rf_names();\">"+"\t\t<input type='radio' name='options' id='radio3-logical' autocomplete='off' ><span data-langkey='Labels'>Labels</span>"+"\t    </label>"+"\t</div>",code_init:function(){$("#label3-"+get_cfg("RF_display_name")).button("toggle")},description:"<span data-langkey='Register file names'>Register file names</span>"});ws_config.push({id:"radio9",type:"Register file",u_class:"user_archived",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label9-true'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' "+"\t\t   aria-label='Is editable: true'"+"\t\t   onclick=\"update_cfg('is_editable',true);\">"+"\t\t<input type='radio' name='options' id='radio9-true'  aria-label='Is editable: true'  autocomplete='off' >On"+"\t    </label>"+"\t    <label id='label9-false'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' "+"\t\t   aria-label='Is editable: false'"+"\t\t   onclick=\"update_cfg('is_editable',false);\">"+"\t\t<input type='radio' name='options' id='radio9-false' aria-label='Is editable: false' autocomplete='off' >Off"+"\t    </label>"+"\t</div>",code_init:function(){$("#label9-"+get_cfg("is_editable")).button("toggle")},description:"<span data-langkey='Editable registers: edit register file values'>Editable registers: edit register file values</span>"});ws_config.push({id:"colorpicker1",type:"Circuitry simulation",u_class:"user_microcode",code_cfg:"<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true' style='margin:0 0 0 0'>"+"\t <input type='color'"+"\t\taria-label='Color for active data'"+"\t\tid='colorpicker1'"+"\t\tdata-show-value='false'"+"\t\tclass='noshadow-d m-0' "+"\t\tonchange=\"update_cfg('color_data_active', $('#colorpicker1').spectrum('get')); refresh();\">"+"</fieldset>",code_init:function(){$("#colorpicker1").spectrum({preferredFormat:"hex",color:get_cfg("color_data_active")})},description:"<span data-langkey='Data-path color'>Data-path color</span> <a href='#' data-toggle='popover1' title='Example of data-path color' data-html='true' data-content='<img alt=\"register file example\" src=\"images/cfg-colors.gif\" class=\"img-fluid\">'><span <span data-langkey='(example)'>(example)</span></a>"});ws_config.push({id:"colorpicker2",type:"Circuitry simulation",u_class:"user_microcode",code_cfg:"<fieldset data-role='controlgroup' data-type='horizontal' data-mini='true' style='margin:0 0 0 0'>"+"\t <input type='color'"+"\t\taria-label='Color for active signal name'"+"\t\tid='colorpicker2'"+"\t\tdata-show-value='false'"+"\t\tclass='noshadow-d m-0' "+"\t\tonchange=\"update_cfg('color_name_active', $('#colorpicker2').spectrum('get')); refresh();\">"+"\t </fieldset> ",code_init:function(){$("#colorpicker2").spectrum({preferredFormat:"hex",color:get_cfg("color_name_active")})},description:"<span data-langkey='Signal color'>Signal color</span>"});ws_config.push({id:"radio10",type:"Circuitry simulation",u_class:"user_archived user_microcode",code_cfg:" <div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label10-true'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Is by value: true'"+"\t\t   onclick=\"update_cfg('is_byvalue',true);\">"+"\t\t<input type='radio' name='options' id='radio10-true'   autocomplete='off' >Value"+"\t    </label>"+"\t    <label id='label10-false'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Is by value: false'"+"\t\t   onclick=\"update_cfg('is_byvalue',false);\">"+"\t\t<input type='radio' name='options' id='radio10-false'  autocomplete='off' >Activation"+"\t    </label>"+"\t</div> ",code_init:function(){$("#label10-"+get_cfg("is_byvalue")).button("toggle")},description:"<span data-langkey='Show by value or by activation'>Show by value or by activation</span>"});ws_config.push({id:"radio5",type:"Circuitry simulation",u_class:"user_microcode",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label5-true'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Is interactive: true'"+"\t\t   onclick=\"update_cfg('is_interactive',true);\">"+"\t\t<input type='radio' name='options' id='radio5-true'   autocomplete='off' >On"+"\t    </label>"+"\t    <label id='label5-false'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Is interactive: false'"+"\t\t   onclick=\"update_cfg('is_interactive',false);\">"+"\t\t<input type='radio' name='options' id='radio5-false'  autocomplete='off' >Off"+"\t    </label>"+"\t</div> ",code_init:function(){$("#label5-"+get_cfg("is_interactive")).button("toggle")},description:"<span data-langkey='Interactive mode: signal value can be updated'>Interactive mode: signal value can be updated</span>"});ws_config.push({id:"radio6",type:"Circuitry simulation",u_class:"user_microcode",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label6-true'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Is quick interactive: true'"+"\t\t   onclick=\"update_cfg('is_quick_interactive',true);\">"+"\t\t<input type='radio' name='options' id='radio6-true'   autocomplete='off' >On"+"\t    </label>"+"\t    <label id='label6-false'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Is quick interactive: false'"+"\t\t   onclick=\"update_cfg('is_quick_interactive',false);\">"+"\t\t<input type='radio' name='options' id='radio6-false'  autocomplete='off' >Off"+"\t    </label>"+"\t</div> ",code_init:function(){$("#label6-"+get_cfg("is_quick_interactive")).button("toggle")},description:"<span data-langkey='Quick interactive mode: quick update of signal value'>Quick interactive mode: quick update of signal value</span>"});ws_config.push({id:"radio11",type:"Accesibility",u_class:"user_archived",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label11-true'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Active voice: true'"+"\t\t   onclick=\"update_cfg('use_voice',true); wepsim_voice_start();\">"+"\t\t<input type='radio' name='options' id='radio11-true'   autocomplete='off' >On"+"\t    </label>"+"\t    <label id='label11-false'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Active voice: false'"+"\t\t   onclick=\"update_cfg('use_voice',false); wepsim_voice_stop();\">"+"\t\t<input type='radio' name='options' id='radio11-false'  autocomplete='off' >Off"+"\t    </label>"+"\t</div>",code_init:function(){$("#label11-"+get_cfg("use_voice")).button("toggle")},description:"<span data-langkey='Active voice: external voice control'>Active voice: external voice control</span>"});ws_config.push({id:"radio13",type:"Accesibility",u_class:"user_archived",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label13-text'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Verbose: text'"+"\t\t   onclick=\"update_cfg('verbal_verbose','text');\">"+"\t\t<input type='radio' name='options' id='radio13-text'   autocomplete='off' >Text"+"\t    </label>"+"\t    <label id='label13-math'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary' style='padding:2 2 2 2;'"+"\t\t   aria-label='Verbose: math'"+"\t\t   onclick=\"update_cfg('verbal_verbose','math');\">"+"\t\t<input type='radio' name='options' id='radio13-math'  autocomplete='off' >Math"+"\t    </label>"+"\t</div>",code_init:function(){$("#label13-"+get_cfg("verbal_verbose")).button("toggle")},description:"<span data-langkey='Verbalization: textual or mathematical'>Verbalization: textual or mathematical</span>"});ws_config.push({id:"select8",type:"Accesibility",u_class:"",code_cfg:"<div class='form-group m-0'>"+" <select name='select8' id='select8' class='form-control form-control-sm custom-select'"+"         aria-label='User Interface for WepSIM' "+"         onchange=\"var opt = $(this).find('option:selected');"+"                    var optValue = opt.val();"+"                    update_cfg('ws_skin_ui', optValue);"+"                    window.removeEventListener('beforeunload', wepsim_confirm_exit);"+"                    window.location='wepsim-' + optValue + '.html';"+'                    return false;"'+"         data-native-menu='false'>"+"    <option value='classic'>Desktop</option>"+"    <option value='compact'>Mobile</option>"+" </select>"+"</div>",code_init:function(){$("#select8").val(get_cfg("ws_skin_ui"))},description:"<span data-langkey='WepSIM User Interface skin'>WepSIM User Interface skin</span>"});ws_config.push({id:"radio14",type:"Accesibility",u_class:"",code_cfg:"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >"+"\t    <label id='label14-only_asm__of__only_frequent__on'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' "+"               aria-label='User Interface set of features for WepSIM: false' "+"\t\t   onclick=\"var optValue = 'only_asm:of:only_frequent:on';"+"\t\t             update_cfg('ws_skin_user', optValue);"+"                         wepsim_restore_view(optValue);"+'\t\t             return false;">'+"\t\t<input type='radio' name='options' id='radio14-false' aria-label='Is expert: false' autocomplete='off' >On"+"\t    </label>"+"\t    <label id='label14-only_asm__of__only_frequent__of'"+"\t\t   class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' "+"               aria-label='User Interface set of features for WepSIM: true' "+"\t\t   onclick=\"var optValue = 'only_asm:of:only_frequent:of';"+"\t\t             update_cfg('ws_skin_user', optValue);"+"                         wepsim_restore_view(optValue);"+'\t\t             return false;">'+"\t\t<input type='radio' name='options' id='radio14-true'  aria-label='Is expert: true'  autocomplete='off' >Off"+"\t    </label>"+"\t</div>",code_init:function(){var optValue=get_cfg("ws_skin_user");$("#label14-"+optValue.replace(/:/g,"__")).button("toggle")},description:"<span data-langkey='Beginner view'>Beginner view</span>"});var ws_examples=[];var ws_examples_set=[{name:"Empty",url:"",url_base_asm:"",url_base_mc:""}];var ws_examples_active=-1;function wepsim_example_reset(){ws_examples=[];ws_examples_active=-1}function wepsim_example_load(e_name){var jobj=null;for(var i=0;i<ws_examples_set.length;i++){if(ws_examples_set[i].name!==e_name){continue}if(typeof ws_examples_set[i].url==="undefined"){continue}jobj=wepsim_url_getJSON(ws_examples_set[i].url);ws_examples=ws_examples.concat(jobj);ws_examples_active=i}return ws_examples}function wepsim_example_loadSet(url_example_set,set_name){ws_examples_set=wepsim_url_getJSON(url_example_set);return ws_examples_set}function wepsim_example_getSet(){return ws_examples_set}function load_from_example_assembly(example_id,chain_next_step){if(-1==ws_examples_active){ws_alert("warning: no active example set");return}inputasm.setValue("Please wait...");inputasm.refresh();var sid=example_id.split(":");var sample_hw="";if(sid.length>0)sample_hw=sid[0];else console.log("warning: example without hardware id");var sample_mc="";if(sid.length>1)sample_mc=sid[1];else console.log("warning: example without microcode id");var sample_asm="";if(sid.length>2)sample_asm=sid[2];else console.log("warning: example without assembly id");var url=ws_examples_set[ws_examples_active].url_base_asm+"asm-"+sample_asm+".txt";var do_next=function(mcode){inputasm.setValue(mcode);inputasm.refresh();var ok=false;var SIMWARE=get_simware();if(SIMWARE.firmware.length!==0){ok=wepsim_compile_assembly(mcode);inputasm.is_compiled=ok}if(false===ok){wsweb_change_workspace_assembly();return}if(true===chain_next_step){setTimeout((function(){wsweb_change_workspace_simulator();show_memories_values()}),50)}wepsim_notify_success("<strong>INFO</strong>","Example ready to be used.")};wepsim_load_from_url(url,do_next);simcore_record_append_new("Load assembly from example "+example_id,'load_from_example_assembly("'+example_id+'", '+chain_next_step+");\n");ga("send","event","example","example.assembly","example.assembly."+sample_hw+"."+sample_asm)}function load_from_example_firmware(example_id,chain_next_step){if(-1==ws_examples_active){ws_alert("warning: no active example set");return}inputfirm.setValue("Please wait...");inputfirm.refresh();var sid=example_id.split(":");var sample_hw="";if(sid.length>0)sample_hw=sid[0];else console.log("warning: example without hardware id");var sample_mc="";if(sid.length>1)sample_mc=sid[1];else console.log("warning: example without microcode id");var sample_asm="";if(sid.length>2)sample_asm=sid[2];else console.log("warning: example without assembly id");var url=ws_examples_set[ws_examples_active].url_base_mc+"mc-"+sample_mc+".txt";inputfirm.setOption("readOnly",false);var do_next=function(mcode){inputfirm.setValue(mcode);inputfirm.refresh();var ok=wepsim_compile_firmware(mcode);inputfirm.is_compiled=ok;if(false===ok){wsweb_change_workspace_microcode();return}if(true===chain_next_step){setTimeout((function(){load_from_example_assembly(example_id,chain_next_step)}),50)}else{show_memories_values();wepsim_notify_success("<strong>INFO</strong>","Example ready to be used.")}};wepsim_load_from_url(url,do_next);simcore_record_append_new("Load firmware from example "+example_id,'load_from_example_firmware("'+example_id+'", false);\n');ga("send","event","example","example.firmware","example.firmware."+sample_hw+"."+sample_mc)}function share_example(m,base_url){var e_description=ws_examples[m].description;e_description=e_description.replace(/<[^>]+>/g,"");var e_id=ws_examples[m].id;var e_hw=ws_examples[m].hardware;var share_title="WepSIM example "+e_id+"...";var share_text="This is a link to the WepSIM example "+e_id+" ("+e_description+"):\n";var share_url=""+base_url+"?mode="+e_hw+"&examples_set="+ws_examples_set[ws_examples_active].name+"&example="+m;return share_information("example_"+m,share_title,share_text,share_url)}function table_examples_html(examples){var ahw="ep";var ep_modes=wepsim_mode_getAvailableModes();var mode=get_cfg("ws_mode");if(mode!=="null"&&!ep_modes.includes(mode)){ahw=mode}var base_url=get_cfg("base_url");var fmt_toggle="";var w100_toggle="";var toggle_cls="";var t_hwmcasm="";var t_index="";var e_title="";var e_type="";var e_level="";var e_hw="";var e_mc="";var e_asm="";var e_description="";var e_id="";var u="";var examples_groupby_type={};for(var m=0;m<examples.length;m++){e_modes=examples[m].modes;if(!e_modes.split(",").includes(mode)){continue}e_hw=examples[m].hardware;if(e_hw!==ahw){continue}e_title=examples[m].title;e_type=examples[m].type;e_level="actual";e_mc=examples[m].microcode;e_asm=examples[m].assembly;e_description=examples[m].description;e_id=examples[m].id;t_hwmcasm=e_hw+":"+e_mc+":"+e_asm;t_index=(m+1).toString().padStart(2," ").replace(/ /g,"&nbsp;");if(fmt_toggle==="")fmt_toggle="bg-light";else fmt_toggle="";if(m%2==0)w100_toggle="collapse7 show";else w100_toggle="";toggle_cls=fmt_toggle+" user_"+e_level;u='<div class="col-sm-auto py-1 '+toggle_cls+'">'+'    <span class="badge badge-pill badge-light">'+t_index+"</span>"+"</div>"+'<div class="col-sm-4    py-1 '+toggle_cls+'">'+'     <span style="cursor:pointer;" '+'           id="example_'+m+'" '+'           onclick="simcore_record_append_pending();'+"                    load_from_example_firmware('"+t_hwmcasm+"', true);"+"                    setTimeout(function() { wsweb_dialog_close('examples'); }, 50);"+'                    return false;"'+'           class="btn-like bg-info text-white text-truncate rounded border px-1 mr-1"'+'           style="cursor:pointer;" data-langkey="'+e_title+'">'+e_title+"</span>"+'<span id="example_reference_'+e_id+'" class="d-none">'+base_url+"?mode="+mode+"&examples_set="+ws_examples_set[ws_examples_active].name+"&example="+m+"</span>"+'    <div class="btn-group btn-group-md">'+'           <button type="button" '+'                   class="btn btn-md btn-outline-info dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+'              <span class="sr-only">Toggle Dropdown</span>'+"           </button>"+'           <div class="dropdown-menu bg-info" style="z-index:1024;">'+'             <a onclick="simcore_record_append_pending();'+"                         load_from_example_firmware('"+t_hwmcasm+"', true);"+"                         wsweb_dialog_close('examples'); "+'                         return false;"'+'                class="dropdown-item text-white bg-info" href="#"><c><span data-langkey="Load example">Load example</span></c></a>'+'             <a onclick="simcore_record_append_pending();'+"                         load_from_example_assembly('"+t_hwmcasm+"', false);"+"                         wsweb_dialog_close('examples'); "+'                         return false;"'+'                class="dropdown-item text-white bg-info" href="#"><c><span data-langkey="Load Assembly only">Load Assembly only</span></c></a>'+'             <a onclick="simcore_record_append_pending();'+"                         load_from_example_firmware('"+t_hwmcasm+"', false);"+"                         wsweb_dialog_close('examples'); "+'                         return false;"'+'                class="dropdown-item text-white bg-info" href="#"><c><span data-langkey="Load Firmware only">Load Firmware only</span></c></a>'+"             <a onclick=\"$('#example_reference_"+e_id+"').removeClass('d-none');"+"                         wepsim_clipboard_CopyFromDiv('example_reference_"+e_id+"');"+"                         $('#example_reference_"+e_id+"').addClass('d-none');"+"                         wsweb_dialog_close('examples'); "+'                         return false;"'+'                class="dropdown-item text-white bg-info" href="#"><c><span data-langkey="Copy reference to clipboard">Copy reference to clipboard</span></c></a>'+"             <a onclick=\"wsweb_dialog_close('examples'); "+"                         share_example('"+m+"', '"+base_url+"');"+'                         return false;"'+'                class="dropdown-item text-white bg-info user_archived" href="#"><c><span data-langkey="Share">Share</span></c></a>'+"           </div>"+"    </div>"+"</div>"+'<div class="col-sm py-1 collapse7 show '+toggle_cls+'">'+"    <c>"+e_description+"</c>"+"</div>"+'<div class="w-100 '+w100_toggle+" "+toggle_cls+'"></div>';if(typeof examples_groupby_type[e_type]==="undefined"){examples_groupby_type[e_type]=[]}examples_groupby_type[e_type].push({row:u,level:e_level})}var o="";u="";var l="";for(m in examples_groupby_type){u='<div class="row py-1">';l=examples_groupby_type[m][0].level;for(var n=0;n<examples_groupby_type[m].length;n++){u=u+examples_groupby_type[m][n].row;if(l!==examples_groupby_type[m][n].level){l=""}}u=u+"</div>";o=o+"<div class='col-sm-12 border-bottom border-secondary text-right text-capitalize font-weight-bold bg-white sticky-top user_"+l+"'>"+ahw.toUpperCase()+": "+m+"</div>"+u}if(o.trim()===""){o='&lt;<span data-langkey="No examples available...">No examples are available for the selected hardware</span>&gt;'}o='<div class="container grid-striped border border-light">'+o+"</div>";return o}function table_helps_html(helps){var o="";var fmt_toggle="";var w100_toggle="";var toggle_cls="";var fmt_header="";var e_title="";var e_itype="";var e_utype="";var e_reference="";var e_description="";var e_id="";var t_index="";var utypes=[];for(var m=0;m<helps.length;m++){if(false===array_includes(utypes,helps[m].u_type)){utypes.push(helps[m].u_type)}}o=o+'<div class="container grid-striped border border-light">'+'<div class="row py-1">';for(m=0;m<helps.length;m++){fmt_header="";if(e_utype!=helps[m].u_type){fmt_header="<div class='float-none text-right text-capitalize font-weight-bold col-12 border-bottom border-secondary bg-white sticky-top'>"+helps[m].u_type+"</div>"}e_title=helps[m].title;e_itype=helps[m].i_type;e_utype=helps[m].u_type;e_uclass=helps[m].u_class;e_reference=helps[m].reference;e_description=helps[m].description;e_id=helps[m].id;var onclick_code="";if("relative"===e_itype)onclick_code="wepsim_help_set_relative('"+e_reference+"');"+"wepsim_help_refresh();";if("absolute"===e_itype)onclick_code="wepsim_help_set_absolute('"+e_reference+"');"+"wepsim_help_refresh();";if("code"===e_itype)onclick_code=e_reference;if(fmt_toggle==="")fmt_toggle="bg-light";else fmt_toggle="";if(m%2==0)w100_toggle="collapse7 show";else w100_toggle="";toggle_cls=fmt_toggle+" "+e_uclass+" "+e_utype;t_index=(m+1).toString().padStart(2," ").replace(/ /g,"&nbsp;");o=o+fmt_header+'<div class="col-sm-auto py-1 '+toggle_cls+'">'+'    <span class="badge badge-pill badge-light">'+t_index+"</span>"+"</div>"+'<div class="col-sm-4 py-1 '+toggle_cls+'">'+'    <span class="btn-like bg-success text-white text-truncate rounded border px-1" '+'          style="cursor:pointer;" '+'          id="help_index_'+m+'" '+'          data-langkey="'+e_title+'" '+'          onclick="simcore_record_append_pending(); '+onclick_code+" ; "+'                   return false;">'+e_title+"</span>"+"</div>"+'<div class="col-sm collapse7 show py-1 '+toggle_cls+'">'+"    <c>"+e_description+"</c>"+"</div>"+'<div class="w-100 '+w100_toggle+" "+toggle_cls+'"></div>'}o=o+"</div></div>";return o}function wepsim_help_refresh(){simcore_record_append_new("Refresh help content","wepsim_help_refresh();\n");var helpdiv="#scroller-help1";var scrolltothetop=function(){var helpdiv_container="scroller-help1";var elto=document.getElementById(helpdiv_container);if(elto!=null)elto.scrollTop=0};var helpurl="";var seg_idiom=get_cfg("ws_idiom");var seg_hardw=simhw_active().sim_short_name;var rel=$("#help1_ref").data("relative");if(typeof rel!="undefined"&&rel!=""){var r=rel.split("#");helpurl="help/"+r[0]+"-"+seg_idiom+".html";resolve_html_url(helpdiv,helpurl,"#"+r[1],scrolltothetop);ga("send","event","help","help.simulator","help.simulator."+rel);return}var ab1=$("#help1_ref").data("absolute");if(typeof ab1!="undefined"&&ab1!=""){helpurl="examples/hardware/"+seg_hardw+"/help/"+ab1+"-"+seg_idiom+".html";resolve_html_url(helpdiv,helpurl,"",scrolltothetop);ga("send","event","help","help."+ab1,"help."+ab1+".*");return}var cod1=$("#help1_ref").data("code");if(typeof cod1!="undefined"&&cod1==="true"){ga("send","event","help","help.code","help.code.*");return}if(typeof rel!="undefined"&&rel==""){var html_index=table_helps_html(ws_help);$(helpdiv).html(html_index);ga("send","event","help","help.index","help.index");return}}function wepsim_help_set_relative(rel){$("#help1_ref").data("relative",rel);$("#help1_ref").data("absolute","");$("#help1_ref").data("code","false");simcore_record_append_new("Update help content",'wepsim_help_set_relative("'+rel+'");\n')}function wepsim_help_set_absolute(ab1){$("#help1_ref").data("relative","");$("#help1_ref").data("absolute",ab1);$("#help1_ref").data("code","false");simcore_record_append_new("Update help content",'wepsim_help_set_absolute("'+ab1+'");\n')}function wepsim_open_help_content(content){$("#scroller-help1").html(content);$("#help1_ref").data("relative","");$("#help1_ref").data("absolute","");$("#help1_ref").data("code","true")}function wepsim_open_help_hardware_summary(){var ahw2=simhw_active().sim_short_name;var img2="examples/hardware/"+ahw2+"/images/cpu.svg?time=20190102";var lyr2="<object id=svg_p2 "+"        data='"+img2+"' "+"        type='image/svg+xml'>"+"Your browser does not support SVG"+"</object>";wepsim_open_help_content(lyr2);simcore_record_append_new("Open hardware summary","wepsim_open_help_hardware_summary();\n")}function request_html_url(r_url){var robj=null;if(false===is_mobile()){if(navigator.onLine)robj=fetch(r_url);else robj=caches.match(r_url).then()}else{robj=$.ajax(r_url,{type:"GET",dataType:"html"})}return robj}function update_div_frompartialhtml(helpdiv,key,data){var default_content="<br>Sorry, No more details available for this element.<p>\n";if(""===data)$(helpdiv).html(default_content);else $(helpdiv).html(data);if(""===data||""===key||"#"===key){return}var help_content=$(helpdiv).filter(key).html();if(typeof help_content==="undefined"){help_content=$(helpdiv).find(key).html()}if(typeof help_content==="undefined"){help_content=default_content}$(helpdiv).html(help_content)}function resolve_html_url(helpdiv,r_url,key,update_div){return request_html_url(r_url).then((function(data){if(typeof data=="object"){data.text().then((function(res){update_div_frompartialhtml(helpdiv,key,res);update_div()}))}else{update_div_frompartialhtml(helpdiv,key,data);update_div()}}))}function update_signal_loadhelp(helpdiv,simhw,key){var curr_idiom=get_cfg("ws_idiom");var help_base="examples/hardware/"+simhw+"/help/signals-"+curr_idiom+".html";resolve_html_url(helpdiv,help_base,"#"+key,(function(){$(helpdiv).trigger("create")}));ga("send","event","help","help.signal","help.signal."+simhw+"."+key)}function update_checker_loadhelp(helpdiv,key){var curr_idiom=get_cfg("ws_idiom");var help_base="help/simulator-"+curr_idiom+".html";resolve_html_url(helpdiv,help_base,"#"+key,(function(){$(helpdiv).trigger("create")}));ga("send","event","help","help.checker","help.checker."+key)}var ws_help=[];ws_help.push({id:"simulator",title:"Execute example",i_type:"code",u_type:"tutorial",u_class:"",reference:"wsweb_dialog_close('help'); "+"wsweb_recordbar_show(); "+"wepsim_checkpoint_loadExample('tutorial_2.txt') ; "+"setTimeout(wsweb_record_play, 1000);",description:"<span data-langkey='help_01_03'>Play the execute example tutorial</span>.<br>"});ws_help.push({id:"simulator",title:"Welcome tutorial",i_type:"code",u_type:"tutorial",u_class:"",reference:"wsweb_dialog_close('help'); "+"sim_tutorial_showframe('welcome', 0);",description:"<span data-langkey='help_01_01'>Open the welcome tutorial</span>.<br>"});ws_help.push({id:"simulator",title:"Simple usage tutorial",i_type:"code",u_type:"tutorial",u_class:"",reference:"wsweb_dialog_close('help'); "+"sim_tutorial_showframe('simpleusage', 0);",description:"<span data-langkey='help_01_02'>Open the simple usage tutorial, for microprogramming and assembly programming</span>.<br>"});ws_help.push({id:"simulator",title:"Simulator: firmware",i_type:"relative",u_type:"simulator",u_class:"user_microcode",reference:"simulator#help_simulator_firmware",description:"<span data-langkey='help_02_01'>How to work with the firmware to be loaded into the control memory</span>.<br>"});ws_help.push({id:"microcode",title:"Microcode format",i_type:"relative",u_type:"simulator",u_class:"user_microcode",reference:"simulator#help_firmware_format",description:"<span data-langkey='help_02_02'>Syntax of the microcode used</span>.<br>"});ws_help.push({id:"simulator",title:"Simulator: assembly",i_type:"relative",u_type:"simulator",u_class:"",reference:"simulator#help_simulator_assembly",description:"<span data-langkey='help_02_03'>How to work with the assembly that use the aforementioned firmware</span>.<br>"});ws_help.push({id:"assembly",title:"Assembly format",i_type:"relative",u_type:"simulator",u_class:"",reference:"simulator#help_assembly_format",description:"<span data-langkey='help_02_04'>Syntax of the assembly elements</span>.<br>"});ws_help.push({id:"simulator",title:"Simulator: execution",i_type:"relative",u_type:"simulator",u_class:"",reference:"simulator#help_simulator_execution",description:"<span data-langkey='help_02_05'>How the simulator can execute the assembly and firmware</span>.<br>"});ws_help.push({id:"simulator",title:"Simulator: states",i_type:"relative",u_type:"simulator",u_class:"",reference:"simulator#help_dumper",description:"<span data-langkey='help_02_06'>How the simulator can show the current state, and the difference between two states</span>.<br>"});ws_help.push({id:"architecture",title:"Simulated architecture",i_type:"absolute",u_type:"simulated processor",u_class:"",reference:"hardware",description:"<span data-langkey='help_03_01'>Description of the simulated processor architecture</span>.<br>"});ws_help.push({id:"architecture",title:"Simulated signals",i_type:"absolute",u_type:"simulated processor",u_class:"user_microcode",reference:"signals",description:"<span data-langkey='help_03_02'>Main signals summary of the simulated elemental processor</span>.<br>"});ws_help.push({id:"architecture",title:"Hardware summary",i_type:"code",u_type:"simulated processor",u_class:"user_microcode",reference:"wepsim_open_help_hardware_summary();"+"simcore_record_append_new('Show hardware summary', "+"                          'wepsim_open_help_hardware_summary();\\\n');",description:"<span data-langkey='help_03_03'>Reference card for the simulated elemental processor hardware</span>.<br>"});ws_help.push({id:"about",title:"License, platforms, etc.",i_type:"relative",u_type:"info",u_class:"",reference:"about#help_about",description:"<span data-langkey='help_04_01'>WepSIM license, supported platforms, technologies used</span>.<br>"});ws_help.push({id:"authors",title:"Authors",i_type:"code",u_type:"info",u_class:"",reference:"wsweb_dialog_close('help'); "+"wsweb_dialog_open('about');",description:"<span data-langkey='help_04_02'>Authors of WepSIM</span>.<br>"});tutorials={};function sim_tutorial_goframe(tutorial_name,from_step,to_step){var tutorial=tutorials[tutorial_name];if(typeof tutorial==="undefined"){return}tutorial[from_step].code_post();if(typeof tutbox!=="undefined"){tutbox.modal("hide")}setTimeout((function(){sim_tutorial_showframe(tutorial_name,to_step)}),tutorial[from_step].wait_next);if(simcore_voice_canSpeak()){window.speechSynthesis.cancel()}}function sim_tutorial_cancelframe(){var ws_mode=get_cfg("ws_mode");wsweb_select_main(ws_mode);tutbox.modal("hide");if(simcore_voice_canSpeak()){window.speechSynthesis.cancel()}}function sim_tutorial_showframe(tutorial_name,step){var tutorial=tutorials[tutorial_name];if(typeof tutorials=="undefined"){return}if(step==tutorial.length){return}if(step<0){return}ga("send","event","help","help.tutorial","help.tutorial.name="+tutorial_name+",step="+step);tutorial[step].code_pre();var wsi=get_cfg("ws_idiom");var bbbt={};bbbt.cancel={label:i18n_get("gui",wsi,"Disable tutorial mode"),className:"btn-danger col float-right",callback:function(){sim_tutorial_cancelframe()}};if(step!=0)bbbt.prev={label:i18n_get("gui",wsi,"Prev."),className:"btn-success col float-right",callback:function(){sim_tutorial_goframe(tutorial_name,step,step-1)}};if(step!=tutorial.length-1)bbbt.next={label:i18n_get("gui",wsi,"Next"),className:"btn-success col float-right",callback:function(){sim_tutorial_goframe(tutorial_name,step,step+1)}};else bbbt.end={label:i18n_get("gui",wsi,"End"),className:"btn-success col float-right",callback:function(){sim_tutorial_goframe(tutorial_name,step,step+1)}};tutbox=bootbox.dialog({title:tutorial[step].title,message:tutorial[step].message,buttons:bbbt,size:"large",animate:false});simcore_voice_speak(tutorial[step].title.replace(/<[^>]*>/g,"")+". "+tutorial[step].message.replace(/<[^>]*>/g,""));i18n_update_tags("tutorial_"+tutorial_name)}tutorials.welcome=[];tutorials.welcome.push({id:"welcome",title:"<span data-langkey='title_0'>title 0</span>",message:"<span data-langkey='message_0'>message 0</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.welcome.push({id:"welcome",title:"<span data-langkey='title_1'>title 1</span>",message:"<span data-langkey='message_1'>message 1</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.welcome.push({id:"welcome",title:"<span data-langkey='title_2'>title 2</span>",message:"<span data-langkey='message_2'>message 2</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.welcome.push({id:"welcome",title:"<span data-langkey='title_3'>title 3</span>",message:"<span data-langkey='message_3'>message 3</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.welcome.push({id:"welcome",title:"<span data-langkey='title_4'>title 4</span>",message:"<span data-langkey='message_4'>message 4</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.welcome.push({id:"welcome",title:"<span data-langkey='title_5'>title 5</span>",message:"<span data-langkey='message_5'>message 5</span>",code_pre:function(){},code_post:function(){load_from_example_firmware("ep:ep_base:ep_s1_e1",true)},wait_next:100});tutorials.simpleusage=[];tutorials.simpleusage.push({id:"simpleusage",title:"<span data-langkey='title_0'>title 0</span>",message:"<span data-langkey='message_0'>message 0</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.simpleusage.push({id:"simpleusage",title:"<span data-langkey='title_1'>title 1</span>",message:"<span data-langkey='message_1'>message 1</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.simpleusage.push({id:"simpleusage",title:"<span data-langkey='title_2'>title 2</span>",message:"<span data-langkey='message_2'>message 2</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.simpleusage.push({id:"simpleusage",title:"<span data-langkey='title_3'>title 3</span>",message:"<span data-langkey='message_3'>message 3</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.simpleusage.push({id:"simpleusage",title:"<span data-langkey='title_4'>title 4</span>",message:"<span data-langkey='message_4'>message 4</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});tutorials.simpleusage.push({id:"simpleusage",title:"<span data-langkey='title_5'>title 5</span>",message:"<span data-langkey='message_5'>message 5</span>",code_pre:simcore_do_nothing_handler,code_post:simcore_do_nothing_handler,wait_next:100});function wepsim_newbie_tour(){var ws_idiom=get_cfg("ws_idiom");wepsim_newbie_tour_setLang(ws_idiom);tour=introJs();tour.setOptions({steps:ws_tour,keyboardNavigation:true,tooltipClass:"tooltip-large",showProgress:true,overlayOpacity:"0.1"});tour.onbeforechange((function(){ws_tour[this._currentStep].do_before()}));tour.onexit((function(){$("#help1").modal("hide");wsweb_dialog_close("examples");wsweb_dialog_close("config");if(get_cfg("ws_mode")!="ep"){wsweb_select_main("ep")}return true}));tour.start();ga("send","event","ui","ui.tour","ui.tour.newbie")}function wepsim_newbie_tour_setLang(lang){var step="";for(var i=0;i<ws_tour.length;i++){step=ws_tour[i].step;if(""!==step){ws_tour[i].intro=i18n.eltos.tour_intro[lang][step]}}}function wepsim_newbie_tour_reload(lang){set_cfg("ws_idiom",lang);save_cfg();i18n_update_tags("gui");tour.exit();wepsim_newbie_tour()}var ws_tour=[];ws_tour.push({intro:i18n_get_welcome(),step:"",position:"auto",do_before:function(){return true}});ws_tour.push({intro:"<span data-langkey='step1'>Step 1</span>",step:"step1",position:"auto",do_before:function(){tour.refresh();return true}});ws_tour.push({element:"#select4",intro:"<span data-langkey='step2'>Step 2</span>",step:"step2",position:"auto",do_before:function(){wsweb_select_main("ep");tour.refresh();return true}});ws_tour.push({element:"#btn_help1",intro:"<span data-langkey='step3'>Step 3</span>",step:"step3",position:"auto",do_before:function(){tour.refresh();return true}});ws_tour.push({element:"#btn_example1",intro:"<span data-langkey='step4'>Step 4</span>",step:"step4",position:"auto",do_before:function(){tour.refresh();return true}});ws_tour.push({element:"#btn_cfg1",intro:"<span data-langkey='step5'>Step 5</span>",step:"step5",position:"auto",do_before:function(){tour.refresh();return true}});ws_tour.push({intro:"<span data-langkey='step6'>Step 6</span>",step:"step6",position:"auto",do_before:function(){tour.refresh();return true}});function wepsim_voice_init(){if(!annyang){return false}annyang.addCommands(wepsim_voice_commands);annyang.addCallback("errorNetwork",(function(){annyang.abort();alert("Sorry but some network connection is needed in order to use the voice recognition engine.")}));SpeechKITT.annyang();SpeechKITT.setStylesheet("external/speechkitt/themes/flat.css");SpeechKITT.setInstructionsText("What can I help you with? (list)");SpeechKITT.vroom();return true}function wepsim_voice_start(){if(!annyang){wepsim_notify_error("<h4>Warning:<br/>"+"annyang not available"+"</h4>","Voice support is not available in this platform.");return false}SpeechKITT.show();return true}function wepsim_voice_stop(){if(!annyang){return false}SpeechKITT.hide();return true}var wepsim_voice_commands={};var wepsim_voice_dialog=null;wepsim_voice_commands["hello"]=function(){var msg="Hello, I am WepSIM, nice to meet you. ";simcore_voice_speak(msg)};wepsim_voice_commands["(show) configuration"]=function(){wsweb_dialog_open("config")};wepsim_voice_commands["(show) examples"]=function(){wsweb_dialog_open("examples")};wepsim_voice_commands["load example :id (from) :level"]=function(id,level){var ex_id=parseInt(id);var ex_lv=parseInt(level);load_from_example_firmware("ep:s"+ex_lv+"_e"+ex_lv,true)};wepsim_voice_commands["(show) help"]=function(){wsweb_dialog_open("help");wepsim_help_refresh()};wepsim_voice_commands["close"]=function(){wsweb_dialog_close("help");wsweb_dialog_close("config");wsweb_dialog_close("examples");if(null!==wepsim_voice_dialog){wepsim_voice_dialog.modal("hide")}};wepsim_voice_commands["reset"]=function(){wepsim_execute_reset(true,true);var msg="Current processor has been reset.";simcore_voice_speak(msg)};wepsim_voice_commands["next"]=function(){wepsim_execute_instruction();var msg="Next executed.";simcore_voice_speak(msg)};wepsim_voice_commands["next micro(instruction)"]=function(){wepsim_execute_microinstruction();var msg="Next microinstruction executed. ";simcore_voice_speak(msg)};wepsim_voice_commands["play"]=function(){wepsim_execute_play("#btn_run_stop")};wepsim_voice_commands["stop"]=function(){wepsim_execute_stop("#btn_run_stop")};wepsim_voice_commands["describe micro(instruction)"]=function(){var msg=get_verbal_from_current_mpc();simcore_voice_speak(msg)};wepsim_voice_commands["describe instruction"]=function(){var msg=get_verbal_from_current_pc();simcore_voice_speak(msg)};wepsim_voice_commands["list"]=function(){var vc_list="available commands:<br>";for(var vc in wepsim_voice_commands){vc_list=vc_list+" * '"+vc+"'<br>"}wepsim_voice_dialog=bootbox.alert(vc_list);wepsim_voice_dialog.modal("show");var msg=$("</p>").html(vc_list).text();simcore_voice_speak(msg)};wepsim_voice_commands["silence"]=function(){simcore_voice_stopSpeak()};function hex2values_update(index){var new_value=parseInt($("#popover1")[0].value);var filter_states=simhw_internalState("filter_states");if(typeof simhw_sim_states().BR[index]!="undefined"){set_value(simhw_sim_states().BR[index],new_value);fullshow_rf_values();$("#rf"+index).click();$("#rf"+index).click()}if(typeof simhw_sim_states()[index]!="undefined"){if(1==simhw_sim_states()[index].nbits)new_value=new_value%2;set_value(simhw_sim_states()[index],new_value);fullshow_eltos(simhw_sim_states(),filter_states);$("#rp"+index).click();$("#rp"+index).click()}}function hex2values(hexvalue,index){var rhex=/[0-9A-F]{1,8}/gi;if(!rhex.test(hexvalue)){hexvalue=0}var valuei=hexvalue>>0;var valueui=hexvalue>>>0;var valuec8=hex2char8(valueui);var valuef=hex2float(valueui);var valuebin=hex2bin(valueui);var valueoct=valueui.toString(8).toUpperCase();var valuehex=valueui.toString(16).toUpperCase();valuehex="0x"+pack8(valuehex);var valuedt="";if(get_cfg("is_editable")==true){valuedt="<tr><td class='py-1 px-1' colspan='5' align='center'>"+"<input type='text' id='popover1' value='"+valueui+"' data-mini='true' style='width:65%'>&nbsp;"+"<span class='badge badge-secondary' "+"      onclick='hex2values_update(\""+index+"\");'>update</span>"+"</td></tr>"}var vtable="<table class='table table-bordered table-hover table-sm mb-1'>"+"<tbody>"+"<tr><td class='p-0 pl-1 align-middle'><strong>hex.</strong></td>"+"    <td class='p-0 pl-1 align-middle'><strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>"+valuehex+"</strong></td>"+"</tr>"+"<tr><td class='p-0 pl-1 align-middle'><strong>oct.</strong></td>"+"    <td class='p-0 pl-1 align-middle'><strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>"+valueoct+"</strong></td>"+"</tr>"+"<tr><td class='p-0 pl-1 align-middle'><strong>binary</strong></td>"+"    <td class='p-0 pl-1 align-middle'><strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>"+valuebin+"</strong></td>"+"</tr>"+"<tr><td class='p-0 pl-1 align-middle'><strong>signed</strong></td>"+"    <td class='p-0 pl-1 align-middle'><strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>"+valuei+"</strong></td>"+"</tr>"+"<tr><td class='p-0 pl-1 align-middle'><strong>unsig.</strong></td>"+"    <td class='p-0 pl-1 align-middle'><strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>"+valueui+"</strong></td>"+"</tr>"+"<tr><td class='p-0 pl-1 align-middle'><strong>char</strong></td>"+"    <td class='p-0 pl-1 align-middle'>"+"<strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>&nbsp;"+valuec8[0]+"&nbsp;</strong>&nbsp;"+"<strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>&nbsp;"+valuec8[1]+"&nbsp;</strong>&nbsp;"+"<strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>&nbsp;"+valuec8[2]+"&nbsp;</strong>&nbsp;"+"<strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>&nbsp;"+valuec8[3]+"&nbsp;</strong>&nbsp;"+"</td>"+"</tr>"+"<tr><td class='p-0 pl-1 align-middle'><strong>float</strong></td>"+"    <td class='p-0 pl-1 align-middle'><strong class='rounded text-dark' style='background-color:#CEECF5;  font-family:monospace;'>"+valuef+"</strong></td>"+"</tr>"+valuedt+"</tbody>"+"</table>";return vtable}function quick_config_rf(){var o="<div class='container mt-1'>"+"<div class='row'>"+"<div class='col-12 p-0'><span data-langkey='Display format'>Display format</span></div>"+"<div class='col-7 p-1'>"+"<buttom class='btn btn-sm btn-outline-secondary col p-1 text-right float-right' "+'        onclick=\'update_cfg("RF_display_format", "unsigned_16_fill"); show_rf_values(); show_states(); return true; \'>'+"0x<span class='mx-auto px-1 font-weight-bold rounded text-dark' style='background-color:#CEECF5; '>0000001A<sub>16</sub></span></buttom>"+"</div>"+"<div class='col p-1'>"+"<buttom class='btn btn-sm btn-outline-secondary col p-1 text-right float-right' "+'        onclick=\'update_cfg("RF_display_format", "unsigned_16_nofill"); show_rf_values(); show_states(); return true; \'>'+"0x<span class='mx-auto px-1 font-weight-bold rounded text-dark' style='background-color:#CEECF5; '>1A<sub>16</sub></span></buttom>"+"</div>"+"<div class='w-100 border border-light'></div>"+"<div class='col-7 p-1'>"+"<buttom class='btn btn-sm btn-outline-secondary col p-1 text-right float-right' "+'        onclick=\'update_cfg("RF_display_format", "unsigned_8_fill"); show_rf_values(); show_states(); return true; \'>'+"<span class='mx-auto px-1 font-weight-bold rounded text-dark' style='background-color:#CEECF5; '>00000032<sub>8&nbsp;</sub></span></buttom>"+"</div>"+"<div class='col p-1'>"+"<buttom class='btn btn-sm btn-outline-secondary col p-1 text-right float-right' "+'        onclick=\'update_cfg("RF_display_format", "unsigned_8_nofill"); show_rf_values(); show_states(); return true; \'>'+"<span class='mx-auto px-1 font-weight-bold rounded text-dark' style='background-color:#CEECF5; '>032<sub>8&nbsp;</sub></span></buttom>"+"</div>"+"<div class='w-100 border border-light'></div>"+"<div class='col-7 p-1'>"+"<buttom class='btn btn-sm btn-outline-secondary col p-1 text-right float-right' "+'        onclick=\'update_cfg("RF_display_format", "unsigned_10_fill"); show_rf_values(); show_states(); return true; \'>'+"+<span class='mx-auto px-1 font-weight-bold rounded text-dark' style='background-color:#CEECF5; '>00000026<sub>10</sub></span></buttom>"+"</div>"+"<div class='col p-1'>"+"<buttom class='btn btn-sm btn-outline-secondary col p-1 text-right float-right' "+'        onclick=\'update_cfg("RF_display_format", "unsigned_10_nofill"); show_rf_values(); show_states(); return true; \'>'+"+<span class='mx-auto px-1 font-weight-bold rounded text-dark' style='background-color:#CEECF5; '>26<sub>10</sub></span></buttom>"+"</div>"+"<div class='w-100 border border-light'></div>"+"<div class='col-7 p-1'>"+"</div>"+"<div class='col p-1'>"+"<buttom class='btn btn-sm btn-outline-secondary col p-1 text-right float-right' "+'        onclick=\'update_cfg("RF_display_format", "float_10_nofill"); show_rf_values(); show_states(); return true; \'>'+"<span class='mx-auto px-1 font-weight-bold rounded text-dark' style='background-color:#CEECF5; '>3.6e-44<sub>10</sub></span></buttom>"+"</div>"+"<div class='w-100 border border-light'></div>"+"<div class='col-12 p-0'><span data-langkey='Register file names'>Register file names</span></div>"+"<div class='col-6 p-1'>"+"<buttom class='btn btn-sm btn-outline-secondary col p-1 text-right float-right' "+'        onclick=\'update_cfg("RF_display_name", "logical"); wepsim_show_rf_names(); return true; \'>'+"<span class='font-weight-bold text-monospace'>$t0</span>"+"&nbsp;"+"<span class='mx-auto px-1 rounded' style='background-color:#CEECF5;'>0</span></buttom>"+"</div>"+"<div class='col-6 p-1'>"+"<buttom class='btn btn-sm btn-outline-secondary col p-1 text-right float-right' "+'        onclick=\'update_cfg("RF_display_name", "numerical"); wepsim_show_rf_names(); return true; \'>'+"<span class='font-weight-bold text-monospace'>R10</span>"+"&nbsp;"+"<span class='mx-auto px-1 rounded' style='background-color:#CEECF5;'>0</span></buttom>"+"</div>"+"<div class='w-100 border border-light'></div>"+"<div class='col p-1'>"+"<button type='button' id='close' data-role='none' "+"        class='btn btn-sm btn-danger w-100 p-0 mt-1' "+'        onclick=\'$("#popover-rfcfg").popover("hide");\'>'+"<span data-langkey='Close'>Close</span>"+"</button>"+"</div>"+"</div>"+"</div>";return o}function wepsim_init_rf(jqdiv){if(jqdiv==""){return}var rf_val=0;var rf_format=get_cfg("RF_display_format");var o1_rf="";var o1_rn="";for(var index=0;index<simhw_sim_states().BR.length;index++){o1_rn="R"+index;o1_rn=o1_rn.padEnd(3," ");rf_val=value2string(rf_format,get_value(simhw_sim_states().BR[index])>>>0);o1_rf+="<button type='button' class='btn py-0 px-1 mt-1 col-auto' "+"        style='border-color:#cecece; background-color:#f5f5f5' data-role='none' "+"        data-toggle='popover-up' data-popover-content='"+index+"' data-container='body' "+"        id='rf"+index+"'>"+"<span id='name_RF"+index+"' class='p-0 text-monospace' style='float:center; '>"+o1_rn+"</span>&nbsp;"+"<span class='badge badge-secondary text-dark' style='background-color:#CEECF5; ' id='tbl_RF"+index+"'>"+rf_val+"</span>"+"</button>"}$(jqdiv).html("<div class='d-flex flex-row flex-wrap justify-content-around justify-content-sm-between'>"+o1_rf+"</div>");$("[data-toggle=popover-up]").popover({html:true,placement:"auto",animation:false,trigger:"click",template:'<div class="popover shadow" role="tooltip">'+'<div class="arrow"></div>'+'<h3  class="popover-header"></h3>'+'<div class="popover-body"></div>'+"</div>",container:"body",content:function(){var index=$(this).attr("data-popover-content");var hexvalue=get_value(simhw_sim_states().BR[index]);return hex2values(hexvalue,index)},title:function(){var index=$(this).attr("data-popover-content");var id_button="&quot;#rf"+index+"&quot;";return'<span class="text-dark"><strong>R'+index+"</strong></span>"+'<button type="button" id="close" class="close" '+'        onclick="$('+id_button+').click();">&times;</button>'},sanitizeFn:function(content){return content}})}function fullshow_rf_values(){var rf_format=get_cfg("RF_display_format");var br_value="";for(var index=0;index<simhw_sim_states().BR.length;index++){br_value=value2string(rf_format,get_value(simhw_sim_states().BR[index])>>>0);$("#tbl_RF"+index).html(br_value)}}var show_rf_values_deferred=null;function innershow_rf_values(){fullshow_rf_values();show_rf_values_deferred=null}function wepsim_show_rf_values(){if(null!==show_rf_values_deferred)return;show_rf_values_deferred=setTimeout(innershow_rf_values,cfg_show_rf_delay)}function wepsim_show_rf_names(){var SIMWARE=get_simware();var disp_name=get_cfg("RF_display_name");var br_value="";for(var index=0;index<simhw_sim_states().BR.length;index++){br_value="R"+index;if("logical"==disp_name&&typeof SIMWARE.registers[index]!="undefined"){br_value=SIMWARE.registers[index]}br_value=br_value.padEnd(3," ");var obj=document.getElementById("name_RF"+index);if(obj!=null){obj.innerHTML=br_value}}}function init_eltos(jqdiv,sim_eltos,filter){if(jqdiv==""){return}var o1="<a data-toggle='popover-rfcfg' id='popover-rfcfg' "+"   tabindex='0' class='m-auto show multi-collapse-3'><strong><strong class='fas fa-wrench text-secondary'></strong></strong></a>";var rf_format=get_cfg("RF_display_format");var divclass="";var value="";var part1="";var part2="";for(var i=0;i<filter.length;i++){var s=filter[i].split(",")[0];var showkey=sim_eltos[s].name;if(sim_eltos[s].nbits>1){part1=showkey.substring(0,3);part2=showkey.substring(3,showkey.length);if(showkey.length<3)showkey='<span class="text-monospace">'+part1+"&nbsp;</span>";else showkey='<span class="text-monospace">'+part1+"</span>";if(part2.length>0)showkey+='<span class="d-none d-sm-inline-flex text-monospace">'+part2+"</span>"}divclass=filter[i].split(",")[1];value=value2string(rf_format,sim_eltos[s].value);o1+="<button type='button' class='btn py-0 px-1 mt-1 "+divclass+"' "+"        style='border-color:#cecece; background-color:#f5f5f5' data-role='none' "+"        data-toggle='popover-bottom' data-popover-content='"+s+"' data-container='body' "+"        id='rp"+s+"'>"+showkey+" <span class='badge badge-secondary text-dark' style='background-color:#CEECF5;' id='tbl_"+s+"'>"+value+"</span>"+"</button>"}$(jqdiv).html("<div class='d-flex flex-row flex-wrap justify-content-around justify-content-sm-between'>"+o1+"</div>");$("[data-toggle=popover-bottom]").popover({html:true,placement:"bottom",animation:false,content:function(){var index=$(this).attr("data-popover-content");var hexvalue=get_value(simhw_sim_states()[index]);return hex2values(hexvalue,index)},title:function(){var index=$(this).attr("data-popover-content");var id_button="&quot;#rp"+index+"&quot;";return'<span class="text-dark"><strong>'+simhw_sim_states()[index].name+"</strong></span>"+'<button type="button" id="close" class="close" '+'        onclick="$('+id_button+').click();">&times;</button>'},sanitizeFn:function(content){return content}});$("[data-toggle=popover-rfcfg]").popover({html:true,placement:"auto",animation:false,trigger:"click",template:'<div class="popover shadow" role="tooltip">'+'<div class="arrow"></div>'+'<h3  class="popover-header"></h3>'+'<div class="popover-body"></div>'+"</div>",container:"body",content:quick_config_rf,sanitizeFn:function(content){return content}}).on("shown.bs.popover",(function(shownEvent){i18n_update_tags("cfg");i18n_update_tags("dialogs")}))}function fullshow_eltos(sim_eltos,filter){var rf_format=get_cfg("RF_display_format");var value="";var r=[];var key="";for(var i=0;i<filter.length;i++){r=filter[i].split(",");key=r[0];value=value2string("text:char:nofill",sim_eltos[key].value);if(sim_eltos[key].nbits>1){value=value2string(rf_format,simhw_sim_state(key).value>>>0)}$("#tbl_"+key).html(value)}}var show_eltos_deferred=null;function show_eltos(sim_eltos,filter){if(null!==show_eltos_deferred)return;show_eltos_deferred=setTimeout((function(){fullshow_eltos(sim_eltos,filter);show_eltos_deferred=null}),cfg_show_eltos_delay)}function wepsim_init_states(jqdiv){var filter_states=simhw_internalState("filter_states");return init_eltos(jqdiv,simhw_sim_states(),filter_states)}function wepsim_show_states(){var filter_states=simhw_internalState("filter_states");return show_eltos(simhw_sim_states(),filter_states)}function simcoreui_init_hw_summary(ahw){var c='<span class="row justify-content-between">';for(var elto in ahw.components){c=c+'<span class="col">'+'<a href="#" class="popover_hw" data-toggle="popover" data-html="true" onclick="event.preventDefault();" title="" data-content="'+"name: "+ahw.components[elto].name+"<br> "+"version: "+ahw.components[elto].version+"<br> "+"abilities: "+ahw.components[elto].abilities.join(" + ")+"<button type='button' id='close' data-role='none' "+"        class='btn btn-sm btn-danger w-100 p-0 mt-2' "+"        onclick=$('.popover_hw').popover('hide');><span data-langkey='Close'>Close</span></button>"+'">'+elto+"</a></span>"}c=c+"</span>";var o="";o+='<div class="card m-2">'+'    <div class="card-header border border-light p-2">'+'      <h5 class="card-title">'+'        <span class="row">'+'          <span class="col-6">'+ahw.sim_name+" ("+ahw.sim_short_name+")</span>"+'          <a data-toggle="collapse" href="#th_processor" role="button"   class="col w-25" '+'aria-expanded="false" aria-controls="th_processor">'+'<img src="'+ahw.sim_img_processor+'" class="img-thumbnail" alt="sim_img_processor"></a>'+'          <a data-toggle="collapse" href="#th_controlunit" role="button" class="col w-25" '+'aria-expanded="false" aria-controls="th_controlunit">'+'<img src="'+ahw.sim_img_controlunit+'" class="img-thumbnail" alt="sim_img_controlunit"></a>'+"        </span>"+"      </h5>"+"    </div>"+'    <div class="card-body border border-light p-2">'+'      <p class="card-text">'+'      <span class="collapse multi-collapse" id="th_processor">'+'<img src="'+ahw.sim_img_processor+'"   class="img-thumbnail mb-2" alt="sim_img_processor"></a>'+"      </span>"+'      <span class="collapse multi-collapse" id="th_controlunit">'+'<img src="'+ahw.sim_img_controlunit+'" class="img-thumbnail mb-2" alt="sim_img_controlunit"></a>'+"      </span>"+c+"      </p>"+"    </div>"+"</div>";return o}function simcoreui_signal_dialog(ahw_elto_name){wepsim_update_signal_dialog(ahw_elto_name);$(".popover_hw").popover("hide")}function simcoreui_init_hw_signals(ahw,update){var elto_n="";var elto_v="";var elto_dv="";var e="";var c='<span class="row justify-content-between">';for(var elto in ahw.signals){elto_v=ahw.signals[elto].value;elto_dv=ahw.signals[elto].default_value;elto_v="0x"+elto_v.toString(16);elto_dv="0x"+elto_dv.toString(16);if(elto_v!=elto_dv)elto_n="font-weight-bold";else elto_n="font-weight-normal";e="<span style='text-align:left'>"+"name: "+ahw.signals[elto].name+"<br>"+"value: "+"<span"+" onclick=simcoreui_signal_dialog('"+ahw.signals[elto].name+"'); "+" class='font-weight-bold'>"+elto_v+"</span><br>"+"default_value: "+elto_dv+"<br>"+"nbits: "+ahw.signals[elto].nbits+"<br>"+"type: "+ahw.signals[elto].type+"<br>"+"visible: "+ahw.signals[elto].visible+"<button type='button' id='close' data-role='none' "+"        class='btn btn-sm btn-danger w-100 p-0 mt-2' "+"        onclick=$('.popover_hw').popover('hide');><span data-langkey='Close'>Close</span></button>"+"</span>";c=c+'<span class="col">'+'<a href="#" id="hw_signal_tt_'+elto+'" class="popover_hw" data-toggle="popover" onclick="event.preventDefault();" '+'   data-html="true" title="" data-content="'+e+'"><span id="hw_signal_strong_'+elto+'" class="'+elto_n+'">'+elto+"</span></a>"+"</span>";if(true==update){$("#hw_signal_strong_"+elto).attr("class",elto_n);$("#hw_signal_tt_"+elto).attr("data-content",e)}}c=c+"</span>";var o='  <div class="card m-2">'+'    <div class="card-header border border-light p-2">'+'      <h5 class="card-title m-0">'+'       <div class="container">'+'       <span class="row">'+'        <span class="col-auto pl-0" data-langkey="Signals">Signals</span>'+'        <span class="col-auto btn btn-sm btn-outline-secondary ml-auto" '+'              data-toggle="tooltip" data-html="true" title="Graph of the signal dependencies <br>(it needs several seconds to be displayed)."'+"              onclick=\"$('#depgraph1c').collapse('toggle'); "+'                       show_visgraph(jit_fire_dep, jit_fire_order);" data-langkey="Dependencies">Dependencies</span>'+"       </span>"+"       </div>"+"      </h5>"+"    </div>"+'    <div class="card-body border border-light p-2">'+'      <div id="depgraph1c" class="m-2 p-0 border collapse h-100" '+'           style="max-height:65vh; overflow:auto; resize:both;">'+'         <span id="depgraph1">Loading...</span>'+"      </div>"+'      <p class="card-text">'+c+"</p>"+"    </div>"+"  </div>";return o}function simcoreui_init_hw_states(ahw,update){var elto_n="";var elto_v="";var elto_dv="";var elto_nb="";var elto_vi="";var e="";var c='<span class="row justify-content-between">';for(var elto in ahw.states){elto_v="-";elto_dv="-";if(typeof ahw.states[elto].value!="undefined"){elto_v=ahw.states[elto].value;elto_dv=ahw.states[elto].default_value;if(typeof elto_v=="object"){elto_v="object";elto_dv="object"}else{if(typeof elto_v=="function"){elto_v=elto_v()}elto_v="0x"+elto_v.toString(16);elto_dv="0x"+elto_dv.toString(16)}}if(elto_v!=elto_dv)elto_n="font-weight-bold";else elto_n="font-weight-normal";if(typeof ahw.states[elto].nbits!="undefined")elto_nb=ahw.states[elto].nbits;else elto_nb="-";if(typeof ahw.states[elto].visible!="undefined")elto_vi=ahw.states[elto].visible;else elto_vi="-";e="<span style='text-align:left'>"+"name: "+elto+"<br>"+"value: <span id=hw_state_value_"+elto+">"+elto_v+"</span><br>"+"default_value: "+elto_dv+"<br>"+"nbits: "+elto_nb+"<br>"+"visible: "+elto_vi+"<button type='button' id='close' data-role='none' "+"        class='btn btn-sm btn-danger w-100 p-0 mt-2' "+"        onclick=$('.popover_hw').popover('hide');><span data-langkey='Close'>Close</span></button>"+"</span>";c=c+'<span class="col">'+'<a href="#" id="hw_state_tt_'+elto+'" class="popover_hw" data-toggle="popover" onclick="event.preventDefault();" '+'   data-html="true" title="" data-content="'+e+'"><span id="hw_state_strong_'+elto+'" class="'+elto_n+'">'+elto+"</span></a>"+"</span>";if(true==update){$("#hw_state_strong_"+elto).attr("class",elto_n);$("#hw_state_tt_"+elto).attr("data-content",e)}}c=c+"</span>";var o='  <div class="card m-2">'+'    <div class="card-header border border-light p-2">'+'      <h5 class="card-title m-0">'+'       <div class="container">'+'       <span class="row">'+'        <span class="col-auto pl-0" data-langkey="States">States</span>'+'        <span class="col-auto btn btn-sm btn-outline-secondary ml-auto" '+'              data-toggle="tooltip" data-html="true" title="It shows the control states: PC, IR, and SP."'+"              onclick=\"$('#ctrlstates1').collapse('toggle');\" data-langkey=\"Control States\">Control States</span>"+"       </span>"+"       </div>"+"      </h5>"+"    </div>"+'    <div class="card-body border border-light p-2">'+'      <div id="ctrlstates1" class="m-2 p-0 border collapse" '+'           style="max-height:65vh; overflow:auto; resize:both;">'+'         <span id="ctrlstates1">'+"         Program Counter      (PC) &rarr; "+ahw.ctrl_states.pc.state+"<br>"+"         Instruction Register (IR) &rarr; "+ahw.ctrl_states.ir.state+"<br>"+"         Stack Pointer        (SP) &rarr; "+ahw.ctrl_states.sp.state+"<br>"+"      </span>"+"      </div>"+'      <p class="card-text">'+c+"</p>"+"    </div>"+"  </div>";return o}function simcoreui_init_hw_behaviors(ahw){var c='<span class="row justify-content-between">';for(var elto in ahw.behaviors){c=c+'<span class="col">'+'<a href="#" class="popover_hw" data-toggle="popover" onclick="event.preventDefault();" '+'   data-html="true" title="" data-content="'+"<span style='text-align:left'>"+"name: "+elto+"<br> "+"nparameters: "+ahw.behaviors[elto].nparameters+"<br> "+"<button type='button' id='close' data-role='none' "+"        class='btn btn-sm btn-danger w-100 p-0 mt-2' "+"        onclick=$('.popover_hw').popover('hide');><span data-langkey='Close'>Close</span></button>"+"</span>"+'">'+elto+"</a></span>"}c=c+"</span>";var o='  <div class="card m-2">'+'    <div class="card-header border border-light p-2">'+'      <h5 class="card-title m-0"><span data-langkey="Behaviors">Behaviors</span></h5>'+"    </div>"+'    <div class="card-body border border-light p-2">'+'      <p class="card-text">'+c+"</p>"+"    </div>"+"  </div>";return o}function simcoreui_init_hw(div_hw){var ahw=simhw_active();var o="";o+=simcoreui_init_hw_summary(ahw);o+=simcoreui_init_hw_signals(ahw,false);o+=simcoreui_init_hw_states(ahw,false);o+=simcoreui_init_hw_behaviors(ahw);$(div_hw).html(o);$('[data-toggle="tooltip"]').tooltip({trigger:"hover",sanitizeFn:function(content){return content}});$(".popover_hw").popover({trigger:"hover click",container:"body",placement:"auto",template:'<div class="popover" role="tooltip">'+'<div class="arrow border-dark" style="border-right-color:black !important;"></div>'+'<h3 class="popover-header"></h3>'+'<div class="popover-body bg-dark text-white border-dark"></div>'+"</div>",sanitizeFn:function(content){return content}});return true}function simcoreui_show_hw(){var ahw=simhw_active();simcoreui_init_hw_signals(ahw,true);simcoreui_init_hw_states(ahw,true);return true}var breakpoint_icon_list={classic:{type:"classic",addclass:"no-dark-mode",origin:"https://www.optikunde.de/farbe/rot.php"},pushpin:{type:"classic",addclass:"no-dark-mode",origin:"http://clipart-library.com/red-push-pin.html"},cat1:{type:"pets",addclass:"no-dark-mode",origin:""},dog1:{type:"pets",addclass:"no-dark-mode",origin:""},halloween1:{type:"halloween",addclass:"no-dark-mode",origin:"https://es.vexels.com/svg-png/halloween/"},halloween2:{type:"halloween",addclass:"no-dark-mode",origin:"https://es.vexels.com/png-svg/vista-previa/153871/casa-de-halloween-de-miedo"},xmas1:{type:"christmas",addclass:"",origin:"https://week-of-icons-2018.netlify.com/data/5/animations/1.gif"},xmas2:{type:"christmas",addclass:"",origin:"https://week-of-icons-2018.netlify.com/data/5/animations/3.gif"},xmas3:{type:"christmas",addclass:"",origin:"https://peaceartsite.com/images/stained-glass-snowy-peace-t.gif"},r2d2:{type:"star wars",addclass:"",origin:"https://imgur.com/gallery/gKSmy"},sw:{type:"star wars",addclass:"",origin:"https://i2.wp.com/icons.iconarchive.com/icons/sensibleworld/starwars/1024/Death-Star-icon.png"},bb8:{type:"star wars",addclass:"no-dark-mode",origin:""},vader1:{type:"star wars",addclass:"",origin:""},ds1:{type:"star wars",addclass:"",origin:"https://media0.giphy.com/media/SVhnmDDdOzrZC/source.gif"},lotr4:{type:"lotr",addclass:"no-dark-mode",origin:"http://www.cinecollectibles.com/gentle-giant-c-1_62.html"},lotr2:{type:"lotr",addclass:"no-dark-mode",origin:"https://www.forbes.com/sites/adrianbridgwater/2016/01/15/microsoft-r-one-big-data-tool-to-rule-them-all/"},lotr6:{type:"lotr",addclass:"no-dark-mode",origin:"https://pm1.narvii.com/5903/f831ee80d012b8a8ba7156c39505cc4824889901_128.jpg"},hp1:{type:"harry potter",addclass:"no-dark-mode",origin:"http://www.logosclicks.com/logos/harry-potter-name-logo-46a93c.html"},hp2:{type:"harry potter",addclass:"no-dark-mode",origin:"https://www.flaticon.com/free-icon/harry-potter_86485"},hp3:{type:"harry potter",addclass:"no-dark-mode",origin:"https://www.flaticon.com/free-icon/harry-potter_86485"},super:{type:"films",addclass:"no-dark-mode",origin:"https://worldvectorlogo.com/logo/superman-3"},batman:{type:"films",addclass:"",origin:"http://getwallpapers.com/collection/black-and-white-batman-wallpaper"},grail:{type:"films",addclass:"no-dark-mode",origin:"http://3png.com/a-31243892.html"},despicable:{type:"films",addclass:"no-dark-mode",origin:"https://www.helloforos.com/t/cerrado/350821/81"},t800a:{type:"films",addclass:"no-dark-mode",origin:"https://purepng.com/photo/27494/movie-terminator-skull"}};function sim_core_breakpointicon_get(icon_name){var icon_obj=null;icon_obj=breakpoint_icon_list[icon_name];if(typeof icon_obj==="undefined"){icon_name="classic";icon_obj=breakpoint_icon_list[icon_name]}return"<img alt='stop icon' height=22 "+"     class='"+icon_obj.addclass+"' "+"     src='images/stop/stop_"+icon_name+".gif'>"}/* 
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  CPU device
         */

        /* jshint esversion: 6 */
        class ws_cpu extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
                    // if no active hardware -> empty 
                    if (simhw_active() === null) {
                        return "<div id='cpu_ALL'></div>" ;
                    }

		    // html holder
		    var o1 = "<div id='cpu_ALL' style='height:58vh; width: inherit; overflow-y: auto;' " +
			     "     class='container container-fluid'>" +
		             "<div class='col-12'>" +
			     "<table class='table table-hover table-sm table-bordered'>" +
			     "<tr>" +
			     "<td align=center width=50%>Instructions</td>" +
			     "<td align=center width=50%>" +
			     "<div id='ins_context'>" + "<span data-bind='text: value'>&nbsp;</span>" + "</div>" +
			     "</td>" +
			     "</tr>" +
			     "<tr>" +
			     "<td align=center width=50%>CLK ticks</td>" +
			     "<td align=center width=50%>" +
			     "<div id='clk_context'>" + "<span data-bind='text: value'>&nbsp;</span>" + "</div>" +
			     "</td>" +
			     "</tr>" +
			     "</table>" +
			     "</div>" +
			     "</div>" ;

		    this.innerHTML = o1 ;

		    // knockout binding
		    ko_rebind_state('CLK',      'clk_context') ;
		    ko_rebind_state('DECO_INS', 'ins_context') ;
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-cpu', ws_cpu) ;

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  Main Memory
         */

        /* jshint esversion: 6 */
        class ws_mainmemory extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
		    // html holder
		    var o1 = "<div id='memory_MP' " + 
                             "     style='height:58vh; width:inherit; overflow-y:scroll; -webkit-overflow-scrolling:touch;'>" + 
                             "</div>" ;

		    this.innerHTML = o1 ;
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-mainmemory', ws_mainmemory) ;


        /*
         *  Main Memory UI
         */

        var show_main_memory_deferred = null;
        var show_main_memory_redraw   = false;

        function wepsim_show_main_memory ( memory, index, redraw, updates )
        {
            if (get_cfg('DBG_delay') > 3) {
                show_main_memory_redraw  = redraw || show_main_memory_redraw ;
	    }

            if (null !== show_main_memory_deferred) {
                return ;
	    }

            show_main_memory_redraw = redraw ;
            show_main_memory_deferred = setTimeout(function ()
                                                   {
						        if (show_main_memory_redraw == false)
						    	    light_refresh_main_memory(memory, index, updates);
                                                        else hard_refresh_main_memory(memory, index, updates) ;

                                                        show_main_memory_deferred = null;
                                                        show_main_memory_updates  = false;

                                                   }, cfg_show_main_memory_delay);
        }

        function hard_refresh_main_memory ( memory, index, redraw )
        {
	    var o1 = "" ;
            var value = "" ;
            var taddr = "" ;

            var valkeys = [] ;

            // todo: move next block to the end of the assembler parser
            var SIMWARE = get_simware() ;

            var revlabels = {} ;
            for (var key in SIMWARE.labels2) {
                 revlabels[SIMWARE.labels2[key]] = key ;
            }

            var seglabels = [] ;
            var curr_segments = simhw_internalState('segments') ;
	    for (var skey in curr_segments) {
                 seglabels.push({ 'begin': parseInt(curr_segments[skey].begin), 'name': skey }) ;
            }

            var seglabels_i = 0 ;
            var seg_o1 = '' ;
            for (key in memory)
            {
                value = main_memory_getword(revlabels, valkeys, memory, key) ;

                seg_o1 = '' ;
		while ( (seglabels_i < seglabels.length) && (parseInt(key) >= seglabels[seglabels_i].begin) )
		{
                    seg_o1 = '<div style="position:sticky;top:0px;z-index:1;width:50%;background:#FFFFFF;">' + 
                             '<b><small>' + seglabels[seglabels_i].name + '</small></b>' + 
                             '</div>' ;
		    seglabels_i++ ;
		}
                o1 += seg_o1 ;

                taddr = '<small>0x</small>' + pack5(valkeys[3]) + '<span class="d-none d-sm-inline-flex"> </span>-' +
                        '<span class="d-none d-sm-inline-flex"><small> 0x</small></span>' + pack5(valkeys[0]) ;

		if (key == index)
		     o1 += "<div class='row' id='addr" + key + "'" +
                           "     style='color:blue; font-size:small; font-weight:bold;    border-bottom: 1px solid lightgray !important'>" +
			   "<div class='col-6 pr-2' align='right'  style='padding:5'>" + taddr + "</div>" +
                           "<div class='col-6'      align='left'   style='padding:5' id='mpval" + key + "'>" + value + "</div>" +
                           "</div>" ;
		else o1 += "<div class='row' id='addr" + key + "'" +
                           "     style='color:black; font-size:small; font-weight:normal; border-bottom: 1px solid lightgray !important'>" +
			   "<div class='col-6 pr-2' align='right'  style='padding:5'>" + taddr + "</div>" +
                           "<div class='col-6'      align='left'   style='padding:5' id='mpval" + key + "'>" + value + "</div>" +
                           "</div>" ;
            }

	    if (typeof memory[index] == "undefined")
	    {
		o1 += "<div class='row' id='addr" + index + "'" +
                      "     style='color:blue; font-size:small; font-weight:bold; border-bottom: 1px solid lightgray !important'>" +
		      "<div class='col-6 pr-2' align='right'  style='padding:5'>" + "0x" + parseInt(index).toString(16) + "</div>" +
		      "<div class='col-6'      align='left'   style='padding:5' id='mpval>" + index + "'>" + "00 00 00 00" + "</div>"+
                      "</div>";
	    }

            $("#memory_MP").html("<div class='container-fluid'>" + o1 + "</div>");

            // scroll up/down to index element...
	    var obj_byid = $('#addr' + index) ;
	    if ( (redraw) && (obj_byid.length > 0) )
            {
	        var topPos = obj_byid[0].offsetTop ;
	            obj_byid = $('#memory_MP') ;
	        if (obj_byid.length > 0)
	            obj_byid[0].scrollTop = topPos - 120;
            }

            // update old_main_add for light_update
            old_main_addr = index ;
        }

        function main_memory_getword ( revlabels, valkeys, memory, key )
        {
                if (typeof memory[key] == "undefined")
                    return "00 00 00 00" ;

		var value  = memory[key].toString(16) ;
		    value  = pack8(value) ;

                var i = 0;
                for (i=0; i<4; i++) {
		     valkeys[i] = (parseInt(key) + i).toString(16) ;
                }

                value2 = '' ;
                for (i=0; i<4; i++)
                {
                     labeli = revlabels["0x" + valkeys[3-i]] ;
                     valuei = value[i*2] + value[i*2+1] ;

                     if (typeof labeli != "undefined")
                          value2 += '<span>' +
                                    '<span style="border:1px solid gray;">' + valuei + '</span>' +
                                    '<span class="badge badge-pill badge-info" ' +
                                    '     style="position:relative;top:-8px;">' + labeli + '</span>' +
                                    '</span>' ;
                     else value2 += valuei + ' ' ;
                }

                return value2 ;
        }

        var old_main_addr = 0;

        function light_refresh_main_memory ( memory, index, redraw )
        {
            if (redraw)
            {
                var valkeys   = [] ;
                var SIMWARE   = get_simware() ;
                var revlabels = {} ;
                for (var key in SIMWARE.labels2)
                     revlabels[SIMWARE.labels2[key]] = key ;
                var svalue = main_memory_getword(revlabels, valkeys, memory, index) ;

                o1 = $("#mpval" + index) ;
                o1.html(svalue);
            }

            o1 = $("#addr" + old_main_addr) ;
            o1.css('color', 'black') ;
            o1.css('font-weight', 'normal') ;

            old_main_addr = index ;

            o1 = $("#addr" + old_main_addr) ;
            o1.css('color', 'blue') ;
            o1.css('font-weight', 'bold') ;
        }


        /*
         *  obj2html
         */

	function labels2html_aux ( slebal, c )
	{
	     var clabel = "" ;
	     var wadd   = "" ;

             for (var j=3; j>=0; j--)
             {
	          wadd = "0x" + (parseInt(c)+j).toString(16);
	          if (typeof slebal[wadd] != "undefined")
                       for (var i=0; i<slebal[wadd].length; i++)
		            clabel = clabel + "<span class='badge badge-pill badge-secondary float-left'>" + slebal[wadd][i] + "</span>" ;
	          else clabel = clabel + "&nbsp;" ;
             }

	     return clabel ;
	}

	function mp2html ( mp, labels, seg )
	{
                // auxiliar for search
                var slebal = {} ;
                for (var l in labels)
                {
                     if (typeof slebal[labels[l]] == "undefined")
                         slebal[labels[l]] = [] ;
                     slebal[labels[l]].push(l);
                }

                var slimits = {} ;
	        for (var skey in seg)
	        {
                     slimits[skey] = {
                                       'c_begin': parseInt(seg[skey].begin),
                                       'c_end':   parseInt(seg[skey].end),
                                       'm_end':   0,
		                       'color':   seg[skey].color
				     } ;
                }
                var a = 0 ;
	        for (var m in mp)
	        {
                     a = parseInt(m, 16) ;
	             for (var skey in seg)
	             {
                          if ( (slimits[skey].c_begin < a) && 
 			       (a < slimits[skey].c_end) && 
 			       (a > slimits[skey].m_end) )
	                  {
                                slimits[skey].m_end = a ;
                          }
                     }
                }

                // output...
		var o  = "";
		    o += "<center>" +
		 	 "<table style='table-layout:auto; border-style: solid; border-width:0px;'>" +
			 "<tr>" +
			 "<th style='border-style: solid; border-width:0px;'>labels</th>" +
			 "<th style='border-style: solid; border-width:1px;'>address</th>" +
			 "<th style='border-style: solid; border-width:1px;'>" +
                         "<table border=0 width=100%>" +
                       //"<tr><td colspan=8 align=center>content </td></tr>" +
                         "<tr align=center>" +
                         "  <td width='25%' align='center'><small><b>byte 3</b></small></td>" +
                         "  <td width='25%' align='center'><small><b>byte 2</b></small></td>" +
                         "  <td width='25%' align='center'><small><b>byte 1</b></small></td>" +
                         "  <td width='25%' align='center'><small><b>byte 0</b></small></td>" +
                         "</tr>" +
                         "<tr>" +
                         "  <td width='12%' align='center' >&nbsp;<sup>31&nbsp;&nbsp;......&nbsp;&nbsp;24</sup>&nbsp;</td>" +
                         "  <td width='12%' align='center' >&nbsp;<sup>23&nbsp;&nbsp;......&nbsp;&nbsp;16</sup>&nbsp;</td>" +
                         "  <td width='12%' align='center' >&nbsp;<sup>15&nbsp;&nbsp;......&nbsp;&nbsp;8</sup>&nbsp;</td>" +
                         "  <td width='12%' align='center' >&nbsp;<sup>7&nbsp;&nbsp;......&nbsp;&nbsp;0</sup>&nbsp;</td>" +
                         "</tr>" +
                         "</table>" +
			 "<th style='border-style: solid; border-width:0px;' align='right'>&nbsp;&nbsp;segment</th>" +
			 "</tr>" ;

	   	var color="white";
	        for (var skey in seg)
	        {
                     c_begin =  slimits[skey].c_begin ;
                     c_end   =  slimits[skey].m_end ;
		     color   =  slimits[skey].color ;
                     rows    =  0 ;
                     var x   =  "" ;

		     for (var i = c_begin; i<c_end; i++)
		     {
                             c = "0x" + i.toString(16) ;
                             if (typeof mp[c] == "undefined") {
                                 continue;
                             }

                             if (0 == rows) {
			         o += "<tr style=\"font-family:'Consolas'; font-size:11pt;\">" +
				      "<td align='right'  style='border-style: solid; border-width:0px;'>" + labels2html_aux(slebal,c) + "</td>" +
				      "<td                style='border-style: solid; border-width:1px;' bgcolor=" + color + ">" + c.toUpperCase() + "</td>" +
				      "<td                style='border-style: solid; border-width:1px;' bgcolor=" + color + ">" +
                                       mp[c].substr(0,8)  + "&nbsp;" + mp[c].substr(8,8)  + "&nbsp;" + mp[c].substr(16,8) + "&nbsp;" + mp[c].substr(24,8) + "</td>" +
				      "<td rowspan=" ;
                             } else {
			         x += "<tr style=\"font-family:'Consolas'; font-size:11pt;\">" +
				      "<td align='right'  style='border-style: solid; border-width:0px;'>" + labels2html_aux(slebal,c) + "</td>" +
				      "<td                style='border-style: solid; border-width:1px;' bgcolor=" + color + ">" + c.toUpperCase() + "</td>" +
				      "<td                style='border-style: solid; border-width:1px;' bgcolor=" + color + ">" +
                                      mp[c].substr(0,8)  + "&nbsp;" + mp[c].substr(8,8)  + "&nbsp;" + mp[c].substr(16,8) + "&nbsp;" + mp[c].substr(24,8) + "</td>" +
				      "</tr>" ;
                             }

                             rows++;
	             }

		     if (0 == rows) {
			 o += "<tr style=\"font-family:'Consolas'; font-size:12pt;\">" +
			      "<td>&nbsp;</td>" +
			      "<td style='border-style: solid; border-width:1px;' bgcolor=" + color + ">0x" + parseInt(seg[skey].begin).toString(16).toUpperCase() + "</td>" +
			      "<td style='border-style: solid; border-width:1px;' bgcolor=" + color + ">&nbsp;</td>" +
			      "<td rowspan=" ;
			 x += "<tr style=\"font-family:'Consolas'; font-size:12pt;\">" +
			      "<td>&nbsp;</td>" +
			      "<td style='border-style: solid; border-width:1px;' bgcolor=" + color + ">0x" + parseInt(seg[skey].end).toString(16).toUpperCase() + "</td>" +
			      "<td style='border-style: solid; border-width:1px;' bgcolor=" + color + ">&nbsp;</td>" +
			      "<td>&nbsp;</td>" +
			      "</tr>" ;
                        rows = 2 ;
		     }

                     o += rows + " align=right>" + seg[skey].name + "&nbsp;</td></tr>" + x ;

	             if (seg[skey].name != ".stack") {
		         o += "<tr style=\"font-family:'Consolas'; font-size:12pt;\">" +
                              "<td>&nbsp;</td>" +
                              "<td valign='middle' align='center' height='25px'>...</td>" +
                              "<td valign='middle' align='center' height='25px'>...</td>" +
                              "<td>&nbsp;</td>" +
                              "</tr>" ;
	             }
	        }

		o += "</table>" +
		     "</center><br>" ;

		return o;
	}

        function segments2html ( segments )
        {
	   var o1 = "<br>" ;

	   o1 += " <center>" +
                 " <table height='400px'>" +
	         " <tr>" +
	         " <td>" +
	         "<table style='border-style: solid' border='1' width='100%' height='100%'>" ;
	   for (var skey in segments)
	   {
	        if (segments[skey].name != ".stack")
	   	    o1 += "<tr><td valign='middle' align='center' height='60px' bgcolor='" + segments[skey].color + "'>" +
                          segments[skey].name +
                          "</td></tr>" +
	   	          "<tr><td valign='middle' align='center' height='25px'>...</td></tr>" ;
	   }
	   o1 += "<tr><td valign='middle' align='center' bgcolor='" + segments['.stack'].color + "'>" +
                 segments['.stack'].name +
                 "</td></tr>" +
	         "</table>" +
	         " </td>" +
	         " <td width='20px'>&nbsp;</td>" +
	         " <td>" +
	         " <table style='border-style: solid; border-width:0px; width:100%; height:100%'>" ;

           var sx = "" ;
           var sp = "" ;
	   for (skey in segments)
	   {
	       sx = "<tr>" +
	   	    "    <td valign='top' align='left' height='30px' style=''>" +
	   	    "    <div id='compile_begin_" + segments[skey].name + "'>" + segments[skey].begin + "</div>" +
	   	    "    </td>" +
	   	    " </tr>" +
	   	    " <tr>" +
	   	    "    <td valign='bottom' align='left' height='30px' style=''>" +
	   	    "    <div id='compile_end_"   + segments[skey].name + "'>" + segments[skey].end + "</div>" +
	   	    "    </td>" +
	   	    " </tr>" ;

	       if (segments[skey].name != ".stack")
	   	    o1 += sx + "<tr><td valign='middle' align='center' height='25px'>...</td></tr>" ;
               else sp  = sx ;
	   }
	   o1 += sp +
	         " </table>" +
	         " </td>" +
	         " </tr>" +
	         " </table>" +
	         " </center>" ;

	   return o1 ;
        }

	function instruction2tooltip ( mp, asm, l )
	{
    	   var wsi = get_cfg('ws_idiom') ;

           // prepare data: ins_quoted + firmware_reference
	   var ins_quoted     = asm[l].source_original.replace(/"/g, '&quot;').replace(/'/g, '&apos;') ;
	   var firm_reference = asm[l].firm_reference ;
	   var nwords         = parseInt(asm[l].firm_reference.nwords) ;

           // prepare data: ins_bin
	   var next = 0 ;
	   var ins_bin = mp[l] ;
	   for (var iw=1; iw<nwords; iw++)
	   {
		  next = "0x" + (parseInt(l, 16) + iw*4).toString(16) ; // 4 -> 32 bits
		  if (typeof mp[next] !== "undefined") {
		      ins_bin += mp[next] ;
		  }
	   }

	   // instruction & bin
	   var o  = '<div class=\"text-center p-1 m-1 border border-secondary rounded\">\n' +
		    ins_quoted  + '<br>\n' +
		    '</div>' +
	       	    '<div class=\"text-left p-1 m-1\">\n' +
		    '<b>' + ins_bin + '</b>\n' +
		    '</div>' ;

	   // details: co, cop & fields
	   var u = '' ;
	   if (typeof    firm_reference.cop !== 'undefined') {
	       u = '+' + firm_reference.cop ;
	   }

	   o +=	'<div class=\"text-left px-2 my-1\">\n' +
	       	'<span class=\"square\">Format:</span>\n' +
	        '<ul class=\"mb-0\">\n' +
		' <li>' + firm_reference.name + ': <b>' + firm_reference.co + u + '</b></li>\n' ;
	   var fields = firm_reference.fields ;
	   for (var f=0; f<fields.length; f++) {
	        o += ' <li>' + fields[f].name + ': bits <b>' + fields[f].stopbit + '</b> to <b>' + fields[f].startbit + '</b></li>\n' ;
	   }
	   o += '</ul>\n' ;

	   // details: microcode
	   o += '<span class=\"user_microcode\">' +
                '<span class=\"square\">Microcode:</span>\n' +
	        '<ul class=\"mb-0\">\n' +
	  	' <li> starts: <b>0x'     + firm_reference['mc-start'].toString(16) + '</b></li>\n' +
		' <li> clock cycles: <b>' + firm_reference.microcode.length + '</b></li>\n' +
	        '</ul>\n' +
                '</span>' +
		'</div>' ;

	   // close
           o += '<button type=\"button\" id=\"close\" data-role=\"none\" ' +
                '        class=\"btn btn-sm btn-danger w-100 p-0 mt-2\" ' +
                '        onclick=$(\".tooltip\").tooltip("hide");>' +
    		         i18n_get('dialogs',wsi,'Close') +
    		'</button>' ;

	   return o ;
        }

	function assembly2html ( mp, labels, seg, asm )
	{
                var  s_label = "" ;
                var s1_instr = "" ;
                var s2_instr = "" ;
                var s3_bin   = "" ;
                var s4_hex   = "" ;
                var bgc = "#F0F0F0" ;
                var o = "" ;
		var l = "" ;

                var a2l = {} ;
                for (l in labels)
		{
                     if (typeof a2l[labels[l]] == "undefined") {
                         a2l[labels[l]] = [] ;
		     }
                     a2l[labels[l]].push(l);
                }

                var a2s = {} ;
                for (l in seg)
		{
                     laddr = "0x" + seg[l].begin.toString(16) ;
                     a2s[laddr] = l;
                }

                o += "<center>" +
                     "<table data-role='table' class='table table-sm'>" +
                     "<tbody>" ;
                for (l in asm)
                {
                     if  (bgc === "#F0F0F0")
                          bgc = "#F8F8F8" ;
                     else bgc = "#F0F0F0" ;

                     asm[l].bgcolor = bgc ;

                     // instruction
		     s3_bin = mp[l] ;
		     if (typeof s3_bin === 'undefined')
		         s3_bin = 0 ;
                     s1_instr = asm[l].source ;
                     s2_instr = asm[l].source_original ;
                     s4_hex   = parseInt(s3_bin, 2).toString(16) ;
                     s4_hex   = "0x" + s4_hex.padStart(1*8, "0") ;
                             // "0x" + "00000000".substring(0, 1*8 - s4_hex.length) + s4_hex ;

                     // labels
                     s_label = "" ;
                     if (typeof a2l[l] != "undefined")
		     {
                         for (var i=0; i<a2l[l].length; i++) {
                              s_label = s_label + "<span class='badge badge-info'>" + a2l[l][i] + "</span>" ;
                         }
                     }

		     // mark pseudo + n-words
		     if (s1_instr === '') {
			 s2_instr = '<span class="text-secondary">' + s2_instr + '</span>' ;
		     }
		else if (s1_instr != s2_instr) {
			 s1_instr = '<span class="text-primary">' + s1_instr + '</span>' ;
			 s2_instr = '<span class="text-primary">' + s2_instr + '</span>' ;
		     }

                     // join the pieces...
                     if (typeof a2s[l] !== "undefined")
		     {
                         o += "<tr bgcolor='#FEFEFE'>" +
                              "<td colspan='7' style='line-height:0.3;' align='left'><small><font color='gray'>" + a2s[l] + "</font></small></td>" +
                              "</tr>" ;
		     }

                     o +=  "<tr id='asmdbg" + l + "' bgcolor='" + asm[l].bgcolor + "'>" +
                           "<td class='asm_label  text-monospace col-auto collapse pb-0' " +
                           "    style='line-height:0.9;' align=right" +
                           "    onclick='asmdbg_set_breakpoint(" + l + "); " +
                           "             if (event.stopPropagation) event.stopPropagation();'>" + s_label + "</td>" +
                           "<td class='asm_addr   text-monospace col-auto collapse' " +
                           "    style='line-height:0.9;'" +
                           "    onclick='asmdbg_set_breakpoint(" + l + "); " +
                           "             if (event.stopPropagation) event.stopPropagation();'>" + l + "</td>" +
                           "<td class='asm_break  text-monospace col-auto show py-0 px-0' " +
                           "    style='line-height:0.9;' id='bp" + l + "' width='1%'" +
                           "    onclick='asmdbg_set_breakpoint(" + l + "); " +
                           "             if (event.stopPropagation) event.stopPropagation();'>" +
			   "    <span data-toggle='tooltip' rel='tooltip1' title='click to toggle breakpoint'>.</span>" +
			   "</td>" +
                           "<td class='asm_hex    text-monospace col-auto collapse' " +
                           "    style='line-height:0.9;' align=left>" +
			   "    <span data-toggle='tooltip' rel='tooltip2' data-placement='right' data-html='true' data-l='" + l + "'>" + 
			   "    <span data-toggle='tooltip' rel='tooltip1' title='click to show instruction format details'>" +
				s4_hex + 
			   "    </span>" +
			   "    </span>" +
		           "</td>" +
                           "<td class='asm_ins    text-monospace col-auto collapse' " +
                           "    style='line-height:0.9;'" +
                           "    onclick='asmdbg_set_breakpoint(" + l + "); " +
                           "             if (event.stopPropagation) event.stopPropagation();'>" + s1_instr + "</td>" +
                           "<td class='asm_pins   text-monospace col-auto collapse' " +
                           "    style='line-height:0.9;' align=left" +
                           "    onclick='asmdbg_set_breakpoint(" + l + "); " +
                           "             if (event.stopPropagation) event.stopPropagation();'>" + s2_instr + "</td>" +
                           "</tr>" ;
                }
                o += "</tbody>" +
                     "</table>" +
                     "</center>" ;

                return o ;
	}

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         * Memory (configuration)
         */

        /* jshint esversion: 6 */
        class ws_mem_config extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
		    // if no active hardware -> empty
		    if (simhw_active() === null) {
			return "<div id='config_MP'></div>" ;
		    }

		    // html holder
		    var o1 = "<div id='config_MP' style='height:58vh; width: inherit; overflow-y: auto;' " +
			     "     class='container container-fluid'>" +
		             "<div class='container-fluid'>" +
			     "<div class='row'>" +
		             "<div class='col-12' style='padding:0 0 10 0;'>" +
			     "<div class='card bg-light'>" +
			     "<div class='card-body p-0' id='mempanel'>" +
			     "<table class='table table-hover table-sm table-bordered' " +
			     "       style='margin:0'>" +
			     "<tbody class='no-ui-mini'>" +
			     "<tr><td align=center'>Wait cycles (<b>0</b> - &infin;)</td>" +
			     "    <td align=center'>" +
			     "<div id='mp_wc'>" +
			     "<input type=number data-bind='value: simhw_internalState(\"MP_wc\")' min='0' max='99999999'>" +
			     "</div>" +
			     "    </td></tr>" +
			     "</tbody>" +
			     "</table>" +
			     "</div>" +
			     "</div>" +
			     "</div>" +
			     "</div>" ;

		    this.innerHTML = o1 ;

		    // knockout binding
		    simhw_internalState_reset('MP_wc', ko_observable(0)) ;
		    var ko_context = document.getElementById('mp_wc');
		    ko.applyBindings(simhw_internalState('MP_wc'), ko_context);
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-mem-config', ws_mem_config) ;

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  Console (keyboard + screen)
         */

        /* jshint esversion: 6 */
        class ws_console extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
		    // html holder
		    var o1 = '<label class="my-0" for="kdb_con" style="min-width:95%">' +
			     '   <img alt="monitor" height="55" src="images/monitor2.png" />' +
			     '</label>' +
			     '<textarea aria-label="monitor"' +
			     '          style="width:100%; overflow-y:auto; -webkit-overflow-scrolling: touch; margin:0 0 8 0"' +
			     '          placeholder="WepSIM" id="kdb_con" rows="8" readonly></textarea>' +
                             '' +
                             '<label class="my-0" for="kdb_key" style="min-width:95%">' +
                             '   <img alt="keyboard" height="35" src="images/keyboard1.png" />' +
                             '</label>' +
                             '<textarea aria-label="keyboard"' +
                             '          style="min-width:100%; overflow-y:auto; -webkit-overflow-scrolling: touch; margin:0 0 0 0"' +
                             '          placeholder="WepSIM" id="kdb_key" rows="2"></textarea>' ;

		    this.innerHTML = o1 ;
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-console', ws_console) ;


        //
        // Screen / Keyboard
        //

	function wepsim_get_screen_content ( )
	{
	      var screen_content = "" ;

	      var scrobj = document.getElementById("kdb_con") ;
              if (scrobj != null) {
		  screen_content = scrobj.value ;
	      }

              simcore_native_set_value("SCREEN", "content", screen_content) ;

	      return screen_content ;
	}

	function wepsim_set_screen_content ( screen_content )
	{
	      var scrobj = document.getElementById("kdb_con") ;
              if (scrobj != null) {
		  scrobj.value = screen_content ;
	      }

              simcore_native_set_value("SCREEN", "content", screen_content) ;

	      return screen_content ;
	}

	function wepsim_get_keyboard_content ( )
	{
	      var keystrokes = "" ;

	      var keyobj = document.getElementById("kdb_key") ;
              if (keyobj != null) {
		  keystrokes = keyobj.value ;
	      }

              simcore_native_set_value("KBD", "keystrokes", keystrokes) ;

	      return keystrokes ;
	}

	function wepsim_set_keyboard_content ( keystrokes )
	{
	      var keyobj = document.getElementById("kdb_key") ;
              if (keyobj != null) {
		  keyobj.value = keystrokes ;
	      }

              simcore_native_set_value("KBD", "keystrokes", keystrokes) ;

	      return true ;
	}

/*    
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  I/O device (information)
         */

        /* jshint esversion: 6 */
        class ws_io_info extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
                    // if no active hardware -> empty 
                    if (simhw_active() === null) {
                        return "<div id='io_ALL'></div>" ;
                    }

		    // default content
		    var curr_iointfactory = simhw_internalState('io_int_factory') ;
		    if (typeof curr_iointfactory == "undefined") 
                    {
		        this.innerHTML = msg_default ;
			return ;
		    }

		    // stats holder
		    var i = 0 ;

		    var o1 = "<div id='io_ALL' style='height:58vh; width: inherit; overflow-y: auto;' " + 
			     "     class='container container-fluid'>" +
                             "<div class='container'>" +
			     "<div class='row'>" +
			     "<div class='col-12'>" +
			     "<table class='table table-hover table-sm table-bordered'>" ;
		    for (i=0; i<curr_iointfactory.length; i++)
		    {
		       o1 += "<tr id='int" + i + "_context'>" +
			     "<td align=center width=50%>" +
			     "<span data-bind=\"style: {fontWeight: active() ? 'bold' : ''}\">" + "Interrupt " + i + "</span>" +
			     "</td>" +
			     "<td align=center width=50%>" +
			     "<span data-bind='text: accumulated'>&nbsp;</span>" +
			     "</td>" +
			     "</tr>" ;
		    }
		    o1 += "</table>" +
			  "</div>" +
			  "</div>" +
			  "</div>" +
			  "</div>" ;

		    this.innerHTML = o1 ;

		    // knockout binding
		    for (i=0; i<curr_iointfactory.length; i++)
		    {
			 if (typeof curr_iointfactory[i].accumulated != "function")
			     curr_iointfactory[i].accumulated = ko_observable(curr_iointfactory[i].accumulated) ;
			 if (typeof curr_iointfactory[i].active != "function")
			     curr_iointfactory[i].active      = ko_observable(curr_iointfactory[i].active) ;
			 var ko_context = document.getElementById('int' + i + '_context');
			 ko.cleanNode(ko_context);
			 ko.applyBindings(curr_iointfactory[i], ko_context);
		    }
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-io-info', ws_io_info) ;

/*    
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  I/O device (config)
         */

        /* jshint esversion: 6 */
        class ws_io_config extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
                    // if no active hardware -> empty 
                    if (simhw_active() === null) {
                        return "<div id='config_IO'></div>" ;
                    }

		    // default content
		    var curr_iointfactory = simhw_internalState('io_int_factory') ;
		    if (typeof curr_iointfactory == "undefined") 
                    {
		        this.innerHTML = msg_default ;
			return ;
		    }

		    // html holder
		    var i = 0 ;

		    var o1 = "<div id='config_IO' style='height:58vh; width: inherit; overflow-y: auto;'>" + 
		             "<div class='container-fluid'>" +
			     "<div class='row'>" +
		             "<div class='col-12 p-0'>" +
			     "<div class='card bg-light m-0'>" +
			     "<div class='card-body p-0' id='iopanel'>" +
		             "<center>" +
			     "<table class='table table-hover table-sm table-bordered m-0'>" +
			     "<tbody class='no-ui-mini'>" +
			     "<tr>" +
			     "<td align=center width='33%'>" +
			     "  <span class='d-none d-sm-inline-flex'>Interrupt identificator</span>" +
			     "  <span class='d-sm-none'>Int. Id.<br>(0 - 7)</span>" +
			     "</td>" +
			     "<td align=center width='33%'>" +
			     "  <span class='d-none d-sm-inline-flex'>CLK period (<b>0</b> - &infin;)</span>" +
			     "  <span class='d-sm-none'>CLK ticks <br>(<b>0</b> - &infin;)</span>" +
			     "</td>" +
			     "<td align=center width='33%'>" +
			     "  <span class='d-none d-sm-inline-flex'>Probability (0 - 1)</span>" +
			     "  <span class='d-sm-none'>Probability <br>(0 - 1)</span>" +
			     "</td>" +
			     "</tr>" ;
		    for (i=0; i<8; i++)
		    {
		       o1 += "<tr>" +
			     "<td align='center' style='padding:0 0 0 0; vertical-align: middle !important'>" +
			     "<span class='p-0 m-0'>" + i + "</span>" +
			     "</td>" +
			     "<td align='center' class='p-0'>" +
			     "<div id='int" + i + "_per' style='margin:0 3 0 3'>" +
			     "<input type=number data-bind='value: period' min='0' max='99999999' class='form-control p-0'>" +
			     "</div>" +
			     "</td>" +
			     "<td align='center' class='p-0'>" +
			     "<div id='int" + i + "_pro' style='margin:0 3 0 3'>" +
			     "<input type='number' data-bind='value: probability' min='0' max='1' step='.05' class='form-control p-0'>" +
			     "</div>" +
			     "</td>" +
			     "</tr>" ;
		    }
		       o1 += "</tbody>" +
			     "</table>" +
			     "</center>" +
		             "</div>" +
			     "</div>" +
			     "</div>" +
			     "</div>" ;

		    this.innerHTML = o1 ;

		    // knockout binding
		    var ko_context = {} ;
		    for (i=0; i<curr_iointfactory.length; i++)
		    {
                         // period
			 if (typeof curr_iointfactory[i].period != "function")
			     curr_iointfactory[i].period = ko_observable(curr_iointfactory[i].period) ;
			 ko_context = document.getElementById('int' + i + '_per');
			 ko.cleanNode(ko_context);
			 ko.applyBindings(curr_iointfactory[i], ko_context);
	
                         // probability
			 if (typeof curr_iointfactory[i].probability != "function")
			     curr_iointfactory[i].probability = ko_observable(curr_iointfactory[i].probability) ;
			 ko_context = document.getElementById('int' + i + '_pro');
			 ko.cleanNode(ko_context);
			 ko.applyBindings(curr_iointfactory[i], ko_context);
		    }
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-io-config', ws_io_config) ;

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve, Javier Lopez Gomez
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  L3D device
         */

        /* jshint esversion: 6 */


        var apirest_name     = "L3D" ;
        var apirest_endpoint = "http://localhost:5000/matrix" ;
        var apirest_user     = "" ;
        var apirest_pass     = "" ;


        class ws_l3d extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
                    // if no active hardware -> empty
                    if (simhw_active() === null) {
                        return "<div id='config_L3D'></div>" ;
                    }

		    // default content
		    var l3d_states = simhw_internalState('l3d_state') ;
	            var l3d_dim    = simhw_internalState('l3d_dim') ;
		    if ( (typeof l3d_states == "undefined") || (typeof l3d_dim == "undefined") )
                    {
		        this.innerHTML = msg_default ;
			return ;
		    }

		    // API REST
		    simcore_rest_add(apirest_name,
				     { 'endpoint': apirest_endpoint,
				       'user':     apirest_user,
				       'pass':     apirest_pass }) ;

		    // html holder
		    var i = 0 ;
		    var ko_context = null ;
		    var offset = 0 ;

		    var o1  = "<div id='config_L3D' style='height:58vh; width:inherit; overflow-y:auto;'>" +
			      "<div class='container'>" +
                              "" +
                              "<a data-toggle='collapse' href='#collapse-l3dcfg' aria-expanded='false' " +
                              "   tabindex='0' class='m-auto' role='button'>" +
                              "<strong><strong class='fas fa-wrench text-secondary'></strong></strong></a>" +
                              "" +
			      "<table id='collapse-l3dcfg' " +
                              " class='table table-hover table-sm table-bordered m-0 collapse'>" +
			      "<tr><td>" +
			      "<input id='apirest_endpoint' type='text' data-bind='value: apirest_endpoint' class='form-control text-info p-0'>" +
			      "</td></tr>" +
			      "</table>" +
                              "" +
			      "<div class='row mt-3'>" +
			      "<div class='col-12' style='perspective:1000px; perspective-origin: 50% 50%;'>" ;
		    for (i=0; i<l3d_states.length/(l3d_dim*l3d_dim); i++)
		    {
			o1 += "<table class='table table-hover table-sm table-bordered pb-3' style='transform: rotateX(20deg);'>" ;
			    for (var j=0; j<l3d_dim; j++)
			    {
			o1 += "<tr>" ;
				    for (var k=0; k<l3d_dim; k++)
				    {
			                 offset = i*Math.pow(l3d_dim, 2) + j*l3d_dim + k ;
			o1 += "<td align='center' id='l3d" + offset + "_context' class='py-0' " +
			      " data-bind=\"event: { click: function(){active(!active());webui_l3d_set();}}\">" +
			      "<i class='fa-lightbulb' data-bind=\"css: active() ? 'fas' : 'far'\"></i>" +
			      "</td>" ;
				    }
			o1 += "</tr>" ;
			    }
			o1 += "</table>" ;
		    }
			o1 += "</div>" +
			      "</div>" +
			      "</div>" +
			      "</div>" ;

		    this.innerHTML = o1 ;

		    // knockout binding
		    for (i=0; i<l3d_states.length; i++)
		    {
			 if (typeof l3d_states[i].active != "function")
			     l3d_states[i].active = ko_observable(l3d_states[i].active) ;
			 ko_context = document.getElementById('l3d' + i + '_context');
			 ko.cleanNode(ko_context);
			 ko.applyBindings(l3d_states[i], ko_context);
		    }

		    if (typeof apirest_endpoint != "function")
			apirest_endpoint = ko_observable(apirest_endpoint) ;
		    ko_context = document.getElementById('apirest_endpoint');
		    ko.cleanNode(ko_context);
		    ko.applyBindings(apirest_endpoint, ko_context);
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined") {
            window.customElements.define('ws-l3d', ws_l3d) ;
        }


	function webui_l3d_set ( )
        {
            // get internal state
	    var l3d_states = simhw_internalState('l3d_state') ;
	    if (typeof l3d_states == "undefined") {
		return false ;
	    }

            compute_general_behavior('L3D_SYNC') ;
            return true ;
        }

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  DBG-MC
         */

        /* jshint esversion: 6 */
        class ws_dbg_mc extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
		    // html holder
		    var o1 = "<div id='memory_MC' " + 
                             "     style='height:60vh; width:inherit; overflow-y:scroll; -webkit-overflow-scrolling:touch;'>" + 
                             "</div>" ;

		    this.innerHTML = o1 ;
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-dbg-mc', ws_dbg_mc) ;


        //
        // breakpoints
        //

        function dbg_set_breakpoint ( addr )
        {
                var icon_theme = get_cfg('ICON_theme') ;
                var dbg_level  = get_cfg('DBG_level') ;

                var o1       = document.getElementById("mcpin" + addr) ;
                var bp_state = simhw_internalState_get('MC_dashboard', addr).breakpoint ;

                if (bp_state === true) {
                    bp_state = false ;
                    o1.innerHTML = "&nbsp;" ;
                } else {
                    bp_state = true ;
                    o1.innerHTML = sim_core_breakpointicon_get(icon_theme) ;
                }

                simhw_internalState_get('MC_dashboard', addr).breakpoint = bp_state ;

                if ( bp_state && ('instruction' === dbg_level) )
                {
                     wepsim_notify_do_notify('<strong>INFO</strong>',
                                             'Please remember to change configuration to execute at microinstruction level.',
		                             'success', 
			                     get_cfg('NOTIF_delay')) ;
                }

		// add if recording
                simcore_record_append_new('Set firmware breakpoint at ' + addr,
                                          'dbg_set_breakpoint(' + addr + ');\n') ;
        }

	function wepsim_show_dbg_mpc ( )
	{
	        var maddr_name = simhw_sim_ctrlStates_get().mpc.state ;
	        var reg_maddr  = get_value(simhw_sim_state(maddr_name)) ;

                show_control_memory(simhw_internalState('MC'),
                                    simhw_internalState('MC_dashboard'),
			            reg_maddr,
                                    false) ;
	}


        /*
         *  Control Memory UI
         */

        function controlmemory_lineToString ( memory, key )
        {
		var value = "" ;

		for (var ks in memory[key])
		{
		     if (1 == memory[key][ks]) {
			 value += ks + " ";
			 continue;
		     }

		     if ("NATIVE" == ks) {
			 value += "&lt;native&gt; " ;
			 continue;
		     }

		     if ("NATIVE_JIT" == ks) {
			 value += "&lt;built-in&gt; " ;
			 continue;
		     }

		     value += ks + "=" + parseInt(memory[key][ks]).toString(2) + " ";
		}

		return value ;
        }

        function hard_refresh_control_memory ( memory, memory_dashboard, index, redraw )
        {
	    var o1    = "" ;
            var key   = "" ;
            var value = "" ;
            var icon_theme = get_cfg('ICON_theme') ;

            var SIMWARE = get_simware() ;
            var revlabels = {} ;
            for (key in SIMWARE.firmware)
                 revlabels[SIMWARE.firmware[key]["mc-start"]] = SIMWARE.firmware[key].name ;

            var maddr = "" ;
            var trpin = "" ;
            var htmllabel = "" ;
            var htmlfill = 0 ;
            for (key in memory)
            {
                value = controlmemory_lineToString(memory, key) ;
                maddr = "0x" + parseInt(key).toString(16) ;
                if (typeof revlabels[key] != "undefined")
		{
                    htmllabel = revlabels[key] ;
		    htmlfill  = 5 - htmllabel.length ;
		    if (htmlfill > 0) {
			for (var i=0; i<htmlfill; i++) {
                             htmllabel = htmllabel + "&nbsp;" ;
			}
		    }

                    maddr = '<span>' +
                            '<span class="badge badge-pill badge-info text-monospace" ' +
                            '      style="position:relative;top:4px;">' + htmllabel + '</span>' +
                            '<span style="border:1px solid gray;">' + maddr + '</span>' +
                            '</span>' ;
	        }

		trpin = "&nbsp;" ;
		if (true == memory_dashboard[key].breakpoint) {
                    trpin = sim_core_breakpointicon_get(icon_theme) ;
		}

		if (key == index)
		     o1 += "<tr id='maddr" + key + "' class='d-flex' " +
                           "    style='color:blue; font-size:small; font-weight:bold' " +
			   "    onclick='dbg_set_breakpoint(" + key + "); " +
                           "             if (event.stopPropagation) event.stopPropagation();'>" +
			   "<td             class='col-3 col-md-2 py-0' align='right'>" + maddr + "</td>" +
			   "<td width='1%'  class='col-auto py-0 px-0' id='mcpin" + key + "'>" + trpin + "</td>" +
			   "<td             class='col py-0'>" + value + "</td></tr>";
		else o1 += "<tr id='maddr" + key + "' class='d-flex' " +
                           "    style='color:black; font-size:small; font-weight:normal' " +
			   "    onclick='dbg_set_breakpoint(" + key + "); " +
                           "             if (event.stopPropagation) event.stopPropagation();'>" +
			   "<td             class='col-3 col-md-2 py-0' align='right'>" + maddr + "</td>" +
			   "<td width='1%'  class='col-auto py-0 px-0' id='mcpin" + key + "'>" + trpin + "</td>" +
			   "<td             class='col py-0'>" + value + "</td></tr>";
            }

	    if (typeof memory[index] == "undefined") {
		o1 += "<tr>" +
		      "<td width='15%'><font style='color:blue; font-size:small; font-weight:bold'>0x" +
                      parseInt(index).toString(16) +
                      "</font></td>" +
		      "<td><font style='color:blue; font-size:small; font-weight:bold'><b>&nbsp;</b></font></td></tr>";
            }

            $("#memory_MC").html("<center><table class='table table-hover table-sm'>" +
                                 "<tbody id='none'>" + o1 + "</tbody>" +
                                 "</table></center>");

            // scroll up/down to index element...
	    var obj_byid = $('#maddr' + index) ;
	    if ( (redraw) && (obj_byid.length > 0) )
            {
	        var topPos = obj_byid[0].offsetTop ;
	            obj_byid = $('#memory_MC') ;
	        if (obj_byid.length > 0)
	            obj_byid[0].scrollTop = topPos;
            }

            // update old_mc_add for light_update
            old_mc_addr = index;
        }

        var old_mc_addr = 0;

        function light_refresh_control_memory ( memory, memory_dashboard, index )
        {
            o1 = $("#maddr" + old_mc_addr) ;
            o1.css('color', 'black') ;
            o1.css('font-weight', 'normal') ;

            old_mc_addr = index ;

            o1 = $("#maddr" + old_mc_addr) ;
            o1.css('color', 'blue') ;
            o1.css('font-weight', 'bold') ;
        }

        var show_control_memory_deferred = null;

        function wepsim_show_control_memory ( memory, memory_dashboard, index, redraw )
        {
            if (null !== show_control_memory_deferred)
                return;

            show_control_memory_deferred = setTimeout(function () {
						         if (false === redraw)
							      light_refresh_control_memory(memory, memory_dashboard, index);
                                                         else  hard_refresh_control_memory(memory, memory_dashboard, index, redraw);
                                                         show_control_memory_deferred = null;
                                                      }, cfg_show_control_memory_delay);
        }


        /*
         *  obj2html
         */

	function firmware2html ( fir, showBinary )
	{
		var i = 0 ;
		var s = "" ;

                var filter = simhw_internalState('filter_signals') ;

		var h = "<tr bgcolor='#FF9900'>" +
                        "<td bgcolor='white'     style='border-style: solid; border-width:0px; border-color:lightgray;'></td>" +
                        "<td bgcolor='lightblue' style='border-style: solid; border-width:1px; border-color:lightgray;'>co</td>" +
                        "<td bgcolor='#FFCC00'   style='border-style: solid; border-width:1px; border-color:lightgray;' align='center'><small><b>&#181;dir</b></small></td>" +
                        "<td bgcolor='white'     style='border-style: solid; border-width:0px; border-color:lightgray;'>&nbsp;&nbsp;</td>" ;
		var contSignals=1;
		for (i=0; i<filter.length; i++) {
                     s = filter[i].split(",")[0] ;
		     h += "<td align='center' style='border-style: solid; border-width:1px;'><small><b>" + simhw_sim_signals()[s].name + "</b></small></td>";
		     contSignals++;
		}
		h += "</tr>" ;
		
		var o  = "<center>";
		    o += "<table style='table-layout:auto; border-style: solid: border-width:0px; border-collapse:collapse;'>";

                var l = 0;
                var line = "";
	        var fragment = "";
		var ico  = "";
		var madd = "";
		for (i=0; i<fir.length; i++)
		{
		    var mstart = fir[i]["mc-start"];
		    var mcode  = fir[i].microcode;
		    for (j=0; j<mcode.length; j++)
		    {
                         if ((++l % 10) == 1)
		             o = o + h ;

			 ico = "";
			 if (typeof fir[i].co != "undefined")
			     ico = parseInt(fir[i].co, 2) ;
                         var isignature = fir[i].signature.split(',')[0] ;

                         line = "";
                         if (j==0)
                              line += "<td style='border-style: solid; border-width:0px; border-color:lightgray;'>" +
				      "<span class='badge badge-pill badge-secondary float-left'>" + isignature + "</span>&nbsp;</td>" +
                                      "<td style='border-style: solid; border-width:1px; border-color:lightgray;'>" + ico + "</td>" ;
                         else line += "<td style='border-style: solid; border-width:0px; border-color:lightgray;'>&nbsp;</td>" +
                                      "<td style='border-style: solid; border-width:1px; border-color:lightgray;'>&nbsp;</td>" ;

                         if (showBinary)
                              madd = "0x" + (mstart + j).toString(16) ;
                         else madd = mstart + j ;

			 line += "<td align='center'  style='border-style: solid; border-width:1px; border-color:lightgray;' bgcolor='white'>" + madd + "</td>" +
                                 "<td bgcolor='white' style='border-style: solid; border-width:0px; border-color:lightgray;'>&nbsp;</td>" ;
			 var mins = mcode[j] ;
		         for (var k=0; k<filter.length; k++)
			 {
                              s = filter[k].split(",")[0] ;

			      var svalue = parseInt(simhw_sim_signals()[s].default_value);
                              var newval = false;
			      if ( (typeof mins[s] != "undefined") && (!isNaN(parseInt(mins[s]))) )
                              {
				   svalue = parseInt(mins[s]);
                                   newval = true;
                              }

			      if ( (s == "SELA" || s == "SELB" || s == "SELC") &&
                                   (typeof mins.MADDR != "undefined") && (!isNaN(parseInt(mins.MADDR))) )
                              {
				   fragment = parseInt(mins.MADDR).toString(2) ;
                                   fragment = "000000000000".substring(0, 12 - fragment.length) + fragment + "000" ;
                                   if (s == "SELA") {
                                       svalue = parseInt(fragment.substring(0,   5), 2);
                                       newval = true;
                                   }
                                   if (s == "SELB") {
                                       svalue = parseInt(fragment.substring(5,  10), 2);
                                       newval = true;
                                   }
                                   if (s == "SELC") {
                                       svalue = parseInt(fragment.substring(10, 15), 2);
                                       newval = true;
                                   }
                              }

                              if (showBinary)
                              {
			          fragment = svalue.toString(2) ;
			          var nbits    = parseInt(simhw_sim_signals()[s].nbits);
			          svalue = "00000000000000000000000000000000".substring(0, nbits - fragment.length) + fragment;

                                  var ngreen = filter[k].split(",")[1] ;
                                  var part1  = svalue.substring(0, ngreen);
                                  var part2  = svalue.substring(ngreen);
                                  svalue     = "<font color=green>" + part1 + "</font>" + part2 ;
                              }

			      if (newval)
			           line += "<td align='center' style='border-style: solid; border-width:1px;'><b>" + svalue + "</b></td>";
			      else line += "<td align='center' style='border-style: solid; border-width:1px;'><font color='grey'>" + svalue + "</font></td>";
			 }

			 o += "<tr>" + line + "</tr>" ;
		    }
		}

		o += "</table></center>";
		return o;
	}

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  DBG-MP
         */

        /* jshint esversion: 6 */
        class ws_dbg_mp extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
		    // html holder
		    var o1 = "<center>" + 
		             "<div id='asm_table' style='overflow-x:auto; -webkit-overflow-scrolling:touch;'>" + 
		   	     "<table class='table ui-responsive ui-table' style='margin-bottom:0px; min-width:700px;'>" + 
		   	     "<thead>" + 
			     "<tr style='border-top:2pt solid white;'>" + 
			     "<th width='1%'>" + 
			     "<a tabindex='0' href='#' class='show multi-collapse-3' data-toggle='popover2' id='popover2_asm'><strong class='fas fa-wrench text-secondary'></strong></a>" + 
			     "</th>" + 
                             "<th width='10%' class='asm_label collapse' align='right'><span data-langkey='labels'>labels</span></th>" + 
			     "<th width='15%' class='asm_addr  collapse'              ><span><span data-langkey='addr'>addr</span></span><span class='d-none d-sm-inline-flex'><span data-langkey='ess'>ess</span></span></th>" + 
                             "<th width='15%' class='asm_hex   collapse' align='right'><span data-langkey='content'>content</span></th>" + 
                             "<th width='30%' class='asm_ins   collapse' align='left' ><span data-langkey='assembly'>assembly</span></th>" + 
			     "<th width='30%' class='asm_pins  collapse' align='left' ><span>pseudo</span><span class='d-none d-md-inline'><small><span data-langkey='instructions'>instructions</span></small></span></th>" + 
			     "</tr>" + 
			     "</thead>" + 
			     "</table>" + 
		   	     "</div>" + 
			     "</center>" + 
                             "" + 
		             "<div id='asm_debugger_container'" + 
                             "     style='overflow-y:auto; overflow-x:auto; height:65vh !important; -webkit-overflow-scrolling:touch;'>" + 
                             "     <div id='asm_debugger' style='min-width:700px;'>" + 
                             "     </div>" + 
		             "</div>" ;

		    this.innerHTML = o1 ;
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-dbg-mp', ws_dbg_mp) ;


        //
        // show/hide Assembly elements/header
        //
    
        function showhideAsmElements ( )
        {
    	var tlabel = [ "label", "addr", "hex", "ins", "pins" ] ;
    
    	for (var tli=0; tli<tlabel.length; tli++)
    	{
                 var label_name  = "SHOWCODE_"   + tlabel[tli] ;
                 var column_name = "table .asm_" + tlabel[tli] ;
                 var column_show = get_cfg(label_name) ;
    
    	     if (column_show !== false)
    	          $(column_name).show() ;
    	     else $(column_name).hide() ;
    	}
        }
    
        function showhideAsmHeader ( )
        {
    	var tlabel = [ "label", "addr", "hex", "ins", "pins" ] ;
    
    	for (var tli=0; tli<tlabel.length; tli++)
    	{
                 var label_name = "SHOWCODE_"   + tlabel[tli] ;
                 var btn_show   = get_cfg(label_name) ;
                 var btn_name   = "#asm_" + tlabel[tli] ;
    
                 $(btn_name).removeClass('btn-outline-secondary').removeClass('btn-dark') ;
    	     if (btn_show !== false) 
                      $(btn_name).addClass('btn-dark') ;
    	     else $(btn_name).addClass('btn-outline-secondary') ;
    	}
        }
    
        function default_asmdbg_content_horizontal ( )
        {
    	 var wsi = get_cfg('ws_idiom') ;
    
    	 var o = "<br>" +
    	         "<div class='card m-3'>" +
    		 "  <div class='row no-gutters'>" +
    		 "  <div class='col-md-12'>" + // -
    		 "  <div class='card-body py-0'>" +
    		 "    <p class='card-text'>" + 
    		 "    <div class='badge badge-primary'>1</div>" +
    		 "    <span data-langkey='simulator intro 1'>" + 
    	         i18n_get('gui',wsi,'simulator intro 1') +
    		 "    </span>" +
    		 "    </p>" +
    		 "  </div>" +
    		 "  </div>" +
    		 "  </div>" +
    		 "</div>" +
    		 "<div class='card m-3'>" +
    		 "  <div class='row no-gutters'>" +
    		 "  <div class='col-md-12'>" + // -
    		 "  <div class='card-body py-0'>" +
    		 "    <p class='card-text'>" + 
    		 "    <div class='badge badge-primary'>2</div>" +
    		 "    <span data-langkey='simulator intro 2'>" + 
    	         i18n_get('gui',wsi,'simulator intro 2') +
    		 "    </span>" +
    		 "    </p>" +
    		 "  </div>" +
    		 "  </div>" +
    		 "  </div>" +
    		 "</div>" +
    		 "<div class='card m-3'>" +
    		 "  <div class='row no-gutters'>" +
    		 "  <div class='col-md-12'>" + // -
    		 "  <div class='card-body py-0'>" +
    		 "    <p class='card-text'>" + 
    		 "    <div class='badge badge-primary'>3</div>" +
    		 "    <span data-langkey='simulator intro 3'>" + 
    	         i18n_get('gui',wsi,'simulator intro 3') +
    		 "    </span>" +
    		 "    </p>" +
    		 "  </div>" +
    		 "  </div>" +
    		 "  </div>" +
    		 "</div>" ;
    
    	 return o ;
        }
    
        function default_asmdbg_content_vertical ( )
        {
    	 var o = "<br>" +
    		 "<div class='container-fluid'>" +
    		 "<div class='card-column row'>" +
    		 "<div class='card m-2 col-sm'>" +
    		 "  <div class='card-body h-50 py-0'>" +
    		 "    <p class='card-text'>" + 
    		 "    <div class='badge badge-primary'>1</div>" +
    		 "    <span data-langkey='simulator intro 1'>" + 
    	         i18n_get('gui',wsi,'simulator intro 1') +
    		 "    </span>" +
    		 "    </p>" +
    		 "  </div>" +
    		 "</div>" +
    		 "<div class='card m-2 col-sm'>" +
    		 "  <div class='card-body h-50 py-0'>" +
    		 "    <p class='card-text'>" + 
    		 "    <div class='badge badge-primary'>2</div>" +
    		 "    <span data-langkey='simulator intro 2'>" + 
    	         i18n_get('gui',wsi,'simulator intro 2') +
    		 "    </span>" +
    		 "    </p>" +
    		 "  </div>" +
    		 "</div>" +
    		 "<div class='card m-2 col-sm'>" +
    		 "  <div class='card-body h-50 py-0'>" +
    		 "    <p class='card-text'>" + 
    		 "    <div class='badge badge-primary'>3</div>" +
    		 "    <span data-langkey='simulator intro 3'>" + 
    	         i18n_get('gui',wsi,'simulator intro 3') +
    		 "    </span>" +
    		 "    </p>" +
    		 "  </div>" +
    		 "</div>" +
    		 "</div>" +
    		 "</div>" ;
    
    	 return o ;
        }
    
        // Popovers
    
        function wepsim_click_asm_columns ( name )
        {
            var label_name = "SHOWCODE_" + name ;
            var show_elto  = get_cfg(label_name) ;
    
    	show_elto = !show_elto ;
    
            var column_name = "table .asm_" + name ;
            if (show_elto !== false)
       	     $(column_name).show() ;
            else $(column_name).hide() ;
    
    	set_cfg(label_name, show_elto) ;
    	save_cfg() ;
    
            var btn_name = "#asm_" + name ;
    	$(btn_name).removeClass('btn-outline-secondary').removeClass('btn-dark') ;
            if (show_elto !== false)
    	     $(btn_name).addClass('btn-dark') ;
    	else $(btn_name).addClass('btn-outline-secondary') ;
        }
    
        function wepsim_show_asm_columns_checked ( asm_po )
        {
    	 var wsi = get_cfg('ws_idiom') ;
    
             var o = '<button type="button" id="asm_label" aria-label="Show label" ' +
    		 '        onclick="wepsim_click_asm_columns(\'label\'); return false;" ' +
    		 '        class="btn btn-sm btn-block btn-outline-secondary mb-1">' + 
    		 '<span class="float-left">' + i18n_get('dialogs',wsi,'Show/Hide labels') + '</span>' +
    		 '</button>' +
    		 '<button type="button" id="asm_hex" aria-label="Show content" ' +
    		 '        onclick="wepsim_click_asm_columns(\'hex\'); return false;" ' +
                     '        class="btn btn-sm btn-block btn-outline-secondary mb-1">' + 
    		 '<span class="float-left">' + i18n_get('dialogs',wsi,'Show/Hide content') + '</span>' +
    		 '</button>' +
    		 '<button type="button" id="asm_ins" aria-label="Show instruction" ' +
    		 '        onclick="wepsim_click_asm_columns(\'ins\'); return false;" ' +
                     '        class="btn btn-sm btn-block btn-outline-secondary mb-1">' + 
    		 '<span class="float-left">' + i18n_get('dialogs',wsi,'Show/Hide assembly') + '</span>' +
    		 '</button>' +
    		 '<button type="button" id="asm_pins" aria-label="Show pseudoinstruction" ' +
    		 '        onclick="wepsim_click_asm_columns(\'pins\'); return false;" ' +
                     '        class="btn btn-sm btn-block btn-outline-secondary mb-1">' + 
    		 '<span class="float-left">' + i18n_get('dialogs',wsi,'Show/Hide pseudo-instructions') + '</span>' +
    		 '</button>' +
                     '<button type="button" id="close" data-role="none" ' +
                     '        class="btn btn-sm btn-danger w-100 p-0 mt-2" ' +
                     '        onclick="$(\'#' + asm_po + '\').popover(\'hide\');">' + 
    		          i18n_get('dialogs',wsi,'Close') +
    		 '</button>' ;
    
             return o ;
        }

        // execution bar

        var show_asmdbg_pc_deferred = null;

	function innershow_asmdbg_pc ( )
	{
	    fullshow_asmdbg_pc();
	    show_asmdbg_pc_deferred = null;
	}

	function wepsim_show_asmdbg_pc ( )
	{
            if (get_cfg('DBG_delay') > 5)
	        return fullshow_asmdbg_pc();

            if (null == show_asmdbg_pc_deferred)
                show_asmdbg_pc_deferred = setTimeout(innershow_asmdbg_pc, cfg_show_asmdbg_pc_delay);
	}

        var old_addr = 0;

	function fullshow_asmdbg_pc ( )
	{
                var o1 = null ;

		if (typeof document === "undefined") {
		    return o1 ;
		}

	        var pc_name = simhw_sim_ctrlStates_get().pc.state ;
	        var reg_pc  = get_value(simhw_sim_state(pc_name)) ;
                var curr_addr = "0x" + reg_pc.toString(16) ;
                var curr_firm = simhw_internalState('FIRMWARE') ;

                if (typeof curr_firm.assembly === "undefined") {
		    return o1 ;
                }

                if (typeof curr_firm.assembly[old_addr] !== "undefined")
                {
                     o1 = $("#asmdbg" + old_addr) ;
                     o1.css('background-color', curr_firm.assembly[old_addr].bgcolor) ;
                }
                else
                {
                     for (var l in curr_firm.assembly)
                     {
                          o1 = $("#asmdbg" + l) ;
                          o1.css('background-color', curr_firm.assembly[l].bgcolor) ;
                     }
                }
                old_addr = curr_addr ;

                o1 = $("#asmdbg" + curr_addr) ;
                o1.css('background-color', '#00EE88') ;

                return o1 ;
	}

        // breakpoints

        function asmdbg_set_breakpoint ( addr )
        {
                var icon_theme = get_cfg('ICON_theme') ;
                var hexaddr    = "0x" + addr.toString(16) ;
                var curr_firm  = simhw_internalState('FIRMWARE') ;

                var o1         = document.getElementById("bp"+hexaddr) ;
                var bp_state   = curr_firm.assembly[hexaddr].breakpoint ;
		var inner_elto = "." ;

		// toggle
                if (bp_state === true) {
                    bp_state = false ;
		    inner_elto = "." ;

                } else {
                    bp_state = true ;
                    inner_elto = sim_core_breakpointicon_get(icon_theme) ;
                }

		// store state
                wepsim_execute_set_breakpoint(hexaddr, bp_state) ;

		// update content
                $("span[rel='tooltip1']").tooltip('hide') ;

                o1.innerHTML = "<span data-toggle='tooltip' rel='tooltip1' title='click to toggle breakpoint'>" + 
			       inner_elto + 
			       "</span>" ;

		// refresh style+events
		wepsim_uicfg_apply() ;

                $("span[rel='tooltip1']").tooltip({
                        trigger:   'hover',
                        html:       true,
                        sanitizeFn: function (content) {
                                       return content ; // DOMPurify.sanitize(content) ;
                                    }
		}) ;

		// add if recording
                simcore_record_append_new('Set assembly breakpoint at ' + addr,
                                          'asmdbg_set_breakpoint(' + addr + ');\n') ;

        }

        // current instruction in draw

        var show_dbg_ir_deferred = null;

	function wepsim_show_dbg_ir ( decins )
	{
            if (null !== show_dbg_ir_deferred) {
                return ;
            }

            show_dbg_ir_deferred = setTimeout(function() {
                                                   fullshow_dbg_ir(decins);
                                                   show_dbg_ir_deferred = null;
                                              }, cfg_show_dbg_ir_delay);
	}

	function fullshow_dbg_ir ( decins )
	{
	     if (typeof document === "undefined") {
	         return ;
             }

	     var o = document.getElementById('svg_p');
	     if (o != null) o = o.contentDocument;
	     if (o != null) o = o.getElementById('tspan3899');
	     if (o != null) o.innerHTML = decins ;

	         o = document.getElementById('svg_cu');
	     if (o != null) o = o.contentDocument;
	     if (o != null) o = o.getElementById('text3611');
	     if (o != null) o.innerHTML = decins ;
	}

        // load assembly in the debugger

	function asmdbg_loadContent ( asmdbg_content )
	{
            $("#asm_debugger").html(asmdbg_content);

            setTimeout(function() {
                    $("span[rel='tooltip1']").tooltip({
                            trigger:   'hover',
                            html:       true,
                            sanitizeFn: function (content) {
                                           return content ; // DOMPurify.sanitize(content) ;
                                        }
		    }) ;

                    $("span[rel='tooltip2']").tooltip({
                            trigger:   'click',
                            html:       true,
                            title:      function() {
				           var l = this.getAttribute('data-l') ;
				           var SIMWARE = get_simware() ;
                                           return instruction2tooltip(SIMWARE.mp, SIMWARE.assembly, l) ;
                                        },
                            sanitizeFn: function (content) {
                                           return content ; // DOMPurify.sanitize(content) ;
                                        }
		    }).on('shown.bs.tooltip', function(shownEvent) {
			   wepsim_uicfg_apply() ;
		    });

            }, 500) ;

            showhideAsmElements();
	}

/*    
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  CPU device
         */

        /* jshint esversion: 6 */
        class ws_cpusvg extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
		    // html holder
		    var o1 = "<div class='container-fluid m-0 p-2'>" +
                             "<div class='row'>" +
                             "   <div class='col' id='eltos_cpu_a' style='padding:0 5 0 0;'>" +
                             "       <object id='svg_p'" +
                             "               title='processor'" +
                             "               data=''" +
                             "               type='image/svg+xml'" +
                             "               style='transform:translate3d(0,0,0);'>" +
                             "           Your browser doesn't support SVG" +
                             "       </object>" +
                             "   </div>" +
                             "   <div class='col' id='eltos_cpu_b' style='padding:0 5 0 5;'>" +
                             "       <object id='svg_cu'" +
                             "               title='control unit'" +
                             "               data=''" +
                             "               type='image/svg+xml'" +
                             "               style='transform:translate3d(0,0,0);'>" +
                             "           Your browser doesn't support SVG" +
                             "       </object>" +
                             "   </div>" +
                             "</div>" +
                             "</div>" ;

		    this.innerHTML = o1 ;
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-cpusvg', ws_cpusvg) ;


        /*
         *  draw
         */

	function wepsim_svg_obj_draw ( obj_name, active, color_active, color_inactive, size_active, size_inactive )
        {
	   var r = obj_name.split(':') ;

	   var o = document.getElementById(r[0]) ;
           if (o === null) return;

	   o = o.contentDocument;
           if (o === null) return;

	   o = o.getElementById(r[1]);
           if (o === null) return;

           if (active)
           {
               o.style.setProperty("stroke",       color_active, "");
               o.style.setProperty("fill",         color_active, "");
               o.style.setProperty("stroke-width", size_active,  "");
           }
           else
           {
               if (o.style.getPropertyValue("stroke") === color_inactive)
                   return;

               o.style.setProperty("stroke",       color_inactive, "");
               o.style.setProperty("fill",         color_inactive, "");
               o.style.setProperty("stroke-width", size_inactive,  "");
           }
        }

        /*
         *  Drawing part
         */
        var DRAW_stop = false ;

	function wepsim_svg_start_drawing ( )
        {
            DRAW_stop = false ;
        }

	function wepsim_svg_stop_drawing ( )
        {
            DRAW_stop = true ;
        }

	function wepsim_svg_is_drawing ( )
        {
            return DRAW_stop ;
        }

	function wepsim_svg_update_draw ( obj, value )
        {
            if (true === DRAW_stop) {
                return ;
	    }

	    var i = 0 ;
	    var j = 0 ;
	    var k = 0 ;

	    var draw_it = get_cfg('is_byvalue'); // 'is_byvalue' belongs to the sim_cfg.js

            /* 1) Check if draw it */
	    if (typeof simhw_sim_state("REG_MICROINS").value[obj.name] != "undefined") {
		draw_it = true;
	    }

	    if ( (false === draw_it) && (typeof obj.depends_on != "undefined") )
	    {
		for (k=0; k<obj.depends_on.length; k++)
		{
		     var sname = obj.depends_on[k] ;
		     if (typeof simhw_sim_state("REG_MICROINS").value[sname] != "undefined") {
			     draw_it = true;
			     break;
		     }
		     else if ("CLK" === sname) {
                             // MRdy/IORdy/etc. (related hw. activated signals) relay on this trick.
                             // Otherwise are not shown because they are not user-set in the microinstruction,
                             // but they are set dynamically by hardware
			     draw_it = true;
			     break;
		     }
		}
	    }

            /* 2) Draw data segments... */
	    var cfg_color_data_active   = get_cfg('color_data_active') ;
	    var cfg_color_data_inactive = get_cfg('color_data_inactive') ;
	    var cfg_color_name_active   = get_cfg('color_name_active') ;
	    var cfg_color_name_inactive = get_cfg('color_name_inactive') ;
	    var cfg_size_active         = get_cfg('size_active') ;
	    var cfg_size_inactive       = get_cfg('size_inactive') ;

	    if (obj.draw_data.length > 1)
	    // (different draws)
	    {
		    for (i=0; i<obj.draw_data.length; i++)
		    for (j=0; j<obj.draw_data[i].length; j++) {
	                   wepsim_svg_obj_draw(obj.draw_data[i][j],
                                               (i===value) && draw_it,
                                               cfg_color_data_active,
                                               cfg_color_data_inactive,
                                               cfg_size_active,
                                               cfg_size_inactive) ;
		    }
	    }
	    else if (obj.nbits === 1)
	    // (same draw) && (nbits === 1)
	    {
		    for (j=0; j<obj.draw_data[0].length; j++) {
	                   wepsim_svg_obj_draw(obj.draw_data[0][j],
                                               (0!=value) && draw_it,
                                               cfg_color_data_active,
                                               cfg_color_data_inactive,
                                               cfg_size_active,
                                               cfg_size_inactive) ;
		    }
	    }
	    else if (obj.draw_data.length === 1)
	    // (same draw) && (nbits > 1)
	    {
		    for (j=0; j<obj.draw_data[0].length; j++) {
	                   wepsim_svg_obj_draw(obj.draw_data[0][j],
                                               draw_it,
                                               cfg_color_data_active,
                                               cfg_color_data_inactive,
                                               cfg_size_active,
                                               cfg_size_inactive) ;
		    }
	    }

            /* 3) Draw name segments... */
	    if (obj.draw_name.length > 1)
	    // (different draws)
	    {
		    for (i=0; i<obj.draw_name.length; i++)
		    for (j=0; j<obj.draw_name[i].length; j++) {
	                   wepsim_svg_obj_draw(obj.draw_name[i][j],
                                               (i===value) && draw_it,
                                               cfg_color_name_active,
                                               cfg_color_name_inactive,
                                               cfg_size_active,
                                               cfg_size_inactive) ;
		    }
	    }
	    else if (obj.nbits === 1)
	    // (same draw) && (nbits === 1)
	    {
		    for (j=0; j<obj.draw_name[0].length; j++) {
	                   wepsim_svg_obj_draw(obj.draw_name[0][j],
                                               (0!=value) && draw_it,
                                               cfg_color_name_active,
                                               cfg_color_name_inactive,
                                               cfg_size_active,
                                               cfg_size_inactive) ;
		    }
	    }
	    else if (obj.draw_name.length === 1)
	    // (same draw) && (nbits > 1)
	    {
		    for (j=0; j<obj.draw_name[0].length; j++) {
	                   wepsim_svg_obj_draw(obj.draw_name[0][j],
                                               draw_it,
                                               cfg_color_name_active,
                                               cfg_color_name_inactive,
                                               cfg_size_active,
                                               cfg_size_inactive) ;
		    }
	    }
	}

        function wepsim_svg_update_bus_visibility ( bus_name, value )
        {
            if (true === DRAW_stop) {
                return ;
	    }

	    var o = document.getElementById('svg_p') ;
	    if (o === null) return ;

	    o = o.contentDocument ;
	    if (o === null) return ;

	    o = o.getElementById(bus_name) ;
	    if (o === null) return ;

	    o.setAttributeNS(null, "visibility", value) ;
            o.style.visibility = value ;
        }

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


        /*
         *  Authors
         */

        /* jshint esversion: 6 */
        class ws_authors extends HTMLElement
        {
	      constructor ()
	      {
		    // parent
		    super();
	      }

	      render ( msg_default )
	      {
		    // html holder
		 var o1 = '<div class="card-desk row mx-auto"' +
                          '     style="max-width:512px;">' +
			  '      <div class="card bg-white text-center col-3 p-0">' +
			  '        <img class="card-img-top img-fluid shadow no-dark-mode" id="collapse-author-1"' +
                          '             src="images/author_fgarcia.png" alt="Felix Garcia Carballeira" />' +
			  '        <div class="card-body p-3">' +
                          '          <a class="btn text-vertical-lr p-0 text-primary"' +
                          '             id="fgarcia">F&eacute;lix Garc&iacute;a Carballeira</a>' +
                          '        </div>' +
			  '        <div id="cf-fgarcia" class="card-footer p-1 collapse collapse7 show bg-white text-left">' +
			  '	  <div class="list-group list-group-flush">' +
		          '          <a class="card-link list-group-item p-1"' +
                          '             ><span class="fab fa-linkedin"></span> linkedin</a>' +
		          '          <a class="card-link list-group-item p-1 m-0"' +
                          '             href="https://www.researchgate.net/profile/Felix_Garcia-Carballeira"><span class="fab fa-researchgate"></span> r-gate</a>' +
		          '          <a class="card-link list-group-item p-1 m-0"' +
                          '             ><span class="fab fa-github"></span> github</a>' +
                          '          </div>' +
                          '        </div>' +
			  '      </div>' +
                          '' +
			  '      <div class="card bg-white text-center col-3 p-0">' +
			  '        <img class="card-img-top img-fluid shadow no-dark-mode" id="collapse-author-2"' +
                          '             src="images/author_acaldero.png" alt="Alejandro Calder&oacute;n Mateos" />' +
			  '        <div class="card-body p-3">' +
                          '          <a class="btn text-vertical-lr p-0 text-primary"' +
                          '             id="acaldero">Alejandro Calder&oacute;n Mateos</a>' +
                          '        </div>' +
			  '        <div id="cf-acaldero" class="card-footer p-1 collapse collapse7 show bg-white text-left">' +
			  '	  <div class="list-group list-group-flush">' +
		          '          <a class="card-link list-group-item p-1"' +
                          '             href="https://www.linkedin.com/in/alejandro-calderon-mateos/"><span class="fab fa-linkedin"></span> linkedin</a>' +
		          '          <a class="card-link list-group-item p-1 m-0"' +
                          '             href="https://www.researchgate.net/profile/Alejandro_Calderon2"><span class="fab fa-researchgate"></span> r-gate</a>' +
		          '          <a class="card-link list-group-item p-1 m-0"' +
                          '             href="https://github.com/acaldero/"><span class="fab fa-github"></span> github</a>' +
                          '          </div>' +
                          '        </div>' +
			  '      </div>' +
                          '' +
			  '      <div class="card bg-white text-center col-3 p-0">' +
			  '        <img class="card-img-top img-fluid shadow no-dark-mode" id="collapse-author-3"' +
                          '             src="images/author_jprieto.png" alt="Javier Prieto Cepeda" />' +
			  '        <div class="card-body p-3">' +
                          '          <a class="btn text-vertical-lr p-0 text-primary"' +
                          '             id="jprieto">Javier Prieto Cepeda</a>' +
                          '        </div>' +
			  '        <div id="cf-jprieto" class="card-footer p-1 collapse collapse7 show bg-white text-left">' +
			  '	  <div class="list-group list-group-flush">' +
		          '          <a class="card-link list-group-item p-1"' +
                          '             href="https://www.linkedin.com/in/javier-prieto-cepeda"><span class="fab fa-linkedin"></span> linkedin</a>' +
		          '          <a class="card-link list-group-item p-1 m-0"' +
                          '             ><span class="fab fa-researchgate"></span> r-gate</a>' +
		          '          <a class="card-link list-group-item p-1 m-0"' +
                          '             ><span class="fab fa-github"></span> github</a>' +
                          '          </div>' +
                          '        </div>' +
			  '      </div>' +
                          '' +
			  '      <div class="card bg-white text-center col-3 p-0">' +
			  '        <img class="card-img-top img-fluid shadow no-dark-mode" id="collapse-author-4"' +
                          '             src="images/author_salonso.png" alt="Sa&uacute;l Alonso Monsalve" />' +
			  '        <div class="card-body p-3">' +
                          '          <a class="btn text-vertical-lr p-0 text-primary"' +
                          '             id="salonso">Sa&uacute;l Alonso Monsalve</a>' +
                          '        </div>' +
			  '        <div id="cf-salonso" class="card-footer p-1 collapse collapse7 show bg-white text-left">' +
			  '	  <div class="list-group list-group-flush">' +
		          '          <a class="card-link list-group-item p-1"' +
                          '             href="https://www.linkedin.com/in/salonsom/"><span class="fab fa-linkedin"></span> linkedin</a>' +
		          '          <a class="card-link list-group-item p-1 m-0"' +
                          '             href="https://www.researchgate.net/profile/Saul_Alonso_Monsalve"><span class="fab fa-researchgate"></span> r-gate</a>' +
		          '          <a class="card-link list-group-item p-1 m-0"' +
                          '             href="https://github.com/saulam/"><span class="fab fa-github"></span> github</a>' +
                          '          </div>' +
                          '        </div>' +
			  '      </div>' +
			  '</div>' ;

		    this.innerHTML = o1 ;
	      }

	      connectedCallback ()
	      {
		    this.render('') ;
	      }
        }

        if (typeof window !== "undefined")
            window.customElements.define('ws-authors', ws_authors) ;

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


    //
    // WepSIM Dialog
    //

    wsweb_dialogs = {

         load_save_assembly: {
            id:        "lssvasm",
	    title:     function() {
                          return wepsim_config_dialog_title("Load/Save Assembly",
                                                            "secondary",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('dialogs', ws_idiom);") ;
		       },
            body:      function() {
		         return "<div id='scroller-lssvasm' class='container-fluid p-0' " +
	           	        "     style='overflow:auto; -webkit-overflow-scrolling:touch;'> " +
                               "<div class='row m-0'>" +
                               "<div class='col-12 col-sm-6 p-2'>" +
		                "<div class='card border-secondary h-100'>" +
			        "<div class='card-header border-secondary text-white bg-secondary p-1'>" +
		                "  <h5 class='m-0'>" +
				"  <span class='text-white bg-secondary' data-langkey='Output'>Output</span>" +
				"  <button class='btn btn-light mx-1 float-right py-0 col-auto' " +
                                "          onclick='var ifntsa2 = document.getElementById(\"inputFileNameToSaveAs2\");" +
				"	            var fileNameToSaveAs = ifntsa2.value;" +
				"	            var textToWrite      = inputasm.getValue();" +
				"	            wepsim_save_to_file(textToWrite, fileNameToSaveAs);" +
		                "                   inputasm.is_modified = false;" +
				"		    return false;'" +
                                "><span data-langkey='Save'>Save</span></button>" +
		               	"  </h5>" +
			      	"</div>" +
			      	" <div class='card-body'>" +
		                "<label for='inputFileNameToSaveAs2'>" +
			        "<em><span data-langkey='Please write the file name'>Please write the file name</span>:</em>" +
			        "</label>" +
	                        "<p><input aria-label='filename to save content' id='inputFileNameToSaveAs2' " +
                                "          class='form-control btn-outline-dark' placeholder='File name where assembly will be saved' style='min-width: 90%;'/></p>" +
			     	" </div>" +
			   	"</div>" +
                               "</div>" +
                               "<div class='col-12 col-sm-6 p-2'>" +
		                "<div class='card border-secondary h-100'>" +
			        "<div class='card-header border-secondary text-white bg-secondary p-1'>" +
		                "  <h5 class='m-0'>" +
				"  <span class='text-white bg-secondary' data-langkey='Input'>Input</span>" +
				"  <button class='btn btn-light mx-1 float-right py-0 col-auto' " +
                                "          onclick='var ftl2 = document.getElementById(\"fileToLoad2\"); " +
                                "                   var fileToLoad = ftl2.files[0]; " +
		                "                   wepsim_file_loadFrom(fileToLoad," +
                                "                                   function(txt){ inputasm.setValue(txt); });" +
				"		    return false;'" +
                                "><span data-langkey='Load'>Load</span></button>" +
		               	"  </h5>" +
			      	"</div>" +
			      	"<div class='card-body'>" +
		                "<label for='fileToLoad2'><em><span data-langkey='Load from this File'>Load from this File</span>:</em></label>" +
	                        "<p><input aria-label='file to load' " +
                                "          type='file' id='fileToLoad2' class='dropify'/></p>" +
			     	"</div>" +
			     	"</div>" +
                               "</div>" +
                               "</div>" +
			   	"</div>" ;
	              },
	    buttons:  {
			 close: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
				callback:  function() {
    					       wsweb_dialog_close('load_save_assembly') ;
					   }
			 }
	              },
            size:     'large',
            onshow:   function() {
			 var o = $("#lssvasm") ;
		         o.find('.modal-header').attr("style", "background-color: black !important") ;
			 o.find('.modal-title').addClass("ml-auto") ;

			 $('.dropify').dropify() ;

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide');
			 wepsim_uicfg_apply() ;

			 wsweb_scroll_record('#scroller-lssvasm') ;
			 simcore_record_captureInit() ;
		      }
         },

         load_save_firmware: {
	    id:       "lssvfir",
	    title:    function() {
                          return wepsim_config_dialog_title("Load/Save Firmware",
                                                            "secondary",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('dialogs', ws_idiom);") ;
		      },
            body:     function() {
		         return "<div id='scroller-lssvfir' class='container-fluid p-0' " +
	           	        "     style='overflow:auto; -webkit-overflow-scrolling:touch;'> " +
                               "<div class='row m-0'>" +
                               "<div class='col-12 col-sm-6 p-2'>" +
		                "<div class='card border-secondary h-100'>" +
			        "<div class='card-header border-secondary text-white bg-secondary p-1'>" +
		                "  <h5 class='m-0'>" +
				"  <span class='text-white bg-secondary' data-langkey='Output'>Output</span>" +
                                //
                                "<div class='btn-group float-right'>" +
				"  <button class='btn btn-light mx-1 py-0 col-auto' " +
                                "          onclick='var fileNameToSaveAs  = document.getElementById(\"inputFileNameToSaveAs\").value;" +
		                "                   var textToWrite       = inputfirm.getValue();" +
		                "                   wepsim_save_to_file(textToWrite, fileNameToSaveAs);" +
		                "                   inputfirm.is_modified = false;" +
				"		    return false;'" +
                                "><span data-langkey='Save'>Save</span></button>" +
                                "  <button type='button' class='btn btn-light dropdown-toggle dropdown-toggle-split' " +
                                "          data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" +
                                "    <span class='sr-only'>Toggle Dropdown</span>" +
                                "  </button>" +
                                "  <div class='dropdown-menu'>" +
                                "    <h6 class='dropdown-header'>Default:</h6>" +
				"    <a class='dropdown-item' href='#' " +
				"       onclick='var fileNameToSaveAs = document.getElementById(\"inputFileNameToSaveAs\").value;" +
		                "                var textToWrite      = inputfirm.getValue();" +
		                "                wepsim_save_to_file(textToWrite, fileNameToSaveAs);" +
				"	         return false;'" +
                                "     ><span data-langkey='Save editor content'>Save editor content</span></a>" +
				"<div class='dropdown-divider'></div>" +
                                "    <h6 class='dropdown-header'>Optional:</h6>" +
				"    <a class='dropdown-item' href='#' " +
				"       onclick='wsweb_save_controlmemory_to_file();" +
				"	         return false;'" +
				"     ><span data-langkey='Save control memory'>Save control memory</span></a>" +
                                "  </div>" +
                                "</div>" +
                                //
		               	"  </h5>" +
			      	"</div>" +
			      	" <div class='card-body'>" +
		                "<label for='inputFileNameToSaveAs'><em><span data-langkey='Please write the file name'>Please write the file name</span>:</em></label>" +
	                        "<p><input aria-label='filename to save content' id='inputFileNameToSaveAs'" +
                                "          class='form-control btn-outline-dark' placeholder='File name where microcode will be saved' style='min-width: 90%;'/></p>" +
			     	" </div>" +
			   	"</div>" +
                               "</div>" +
                               "<div class='col-12 col-sm-6 p-2'>" +
		                "<div class='card border-secondary h-100'>" +
			        "<div class='card-header border-secondary text-white bg-secondary p-1'>" +
		                " <h5 class='m-0'>" +
				" <span class='text-white bg-secondary' data-langkey='Input'>Input</span>" +

				" <button class='btn btn-light mx-1 float-right py-0 col-auto' " +
                                "         onclick='var ftl = document.getElementById(\"fileToLoad\").files[0];" +
		                "                  wepsim_file_loadFrom(ftl," +
			        "                 		 function(txt){ inputfirm.setValue(txt); });" +
				"		   return false;'" +
                                "><span data-langkey='Load'>Load</span></button>" +
		               	"  </h5>" +
			      	"</div>" +
			      	"<div class='card-body'>" +
		                "<label for='fileToLoad'><em><span data-langkey='Load from this File'>Load from this File</span>:</em></label>" +
	                        "<p><input aria-label='file to load' type='file' id='fileToLoad' class='dropify'/></p>" +
			     	"</div>" +
			     	"</div>" +
                               "</div>" +
                               "</div>" +
			   	"</div>" ;
		      },
	    buttons:  {
			 close: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
				callback:  function() {
    					       wsweb_dialog_close('load_save_firmware') ;
					   }
			 }
	              },
            size:     'large',
            onshow:   function() {
			 var o = $("#lssvfir") ;
		         o.find('.modal-header').attr("style", "background-color: black !important") ;
			 o.find('.modal-title').addClass("ml-auto") ;

		         // dropify
			 $('.dropify').dropify() ;

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide');
			 wepsim_uicfg_apply() ;

			 wsweb_scroll_record('#scroller-lssvfir') ;
			 simcore_record_captureInit() ;
		      }
         },

	 // binary_asm
         binary_asm: {
            id:      "bin_asm",
	    title:   function() {
                          return wepsim_config_dialog_title("Binary",
                                                            "secondary",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('dialogs', ws_idiom);") ;
		     },
            body:    function() {
		        return "<div id='scroller-bin2a' class='container-fluid p-1' " +
           		       "     style='max-height:70vh; max-width:100%; overflow:auto; -webkit-overflow-scrolling:touch;'> " +
	           	       "   <div id='compile_bin2a' " +
	           	       "        class='p-3' " +
	           	       "        style='width:100%; height: inherit !important;'> " +
			       "	<div class='d-flex align-items-center'> " +
			       "	Loading binary, please wait... <br/> " +
			       "	WARNING: loading binary might take time on slow devices. " +
			       "	</div> " +
		               "   </div> " +
		               "</div>" ;
		     },
	    buttons: {
			OK: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
    					      wsweb_dialog_close('binary_asm') ;
				           }
			     }
	             },
            size:    'large',
            onshow:  function() {
                         // get binary
			 var simware = wepsim_get_binary_code() ;
			 if (null == simware) {
                             setTimeout(function() { wsweb_dialog_close('binary_asm'); }, 50) ;
			     return ;
			 }

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide') ;
			 wepsim_uicfg_apply() ;

                         // show binary
                         setTimeout(function(){
                            $('#compile_bin2a').html(mp2html(simware.mp, simware.labels2, simware.seg)) ;
                            for (var skey in simware.seg) {
                                 $("#compile_begin_" + skey).html("0x" + simware.seg[skey].begin.toString(16));
                                 $("#compile_end_"   + skey).html("0x" + simware.seg[skey].end.toString(16));
                            }

                            $('#bin_asm').modal('handleUpdate') ;
			    wsweb_scroll_record('#scroller-bin2a') ;
			    simcore_record_captureInit() ;
                         }, 10);
		     }
         },

	 // binary_fir
         binary_fir: {
            id:      "bin_fir",
	    title:   function() {
                          return wepsim_config_dialog_title("Binary",
                                                            "secondary",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('dialogs', ws_idiom);") ;
		     },
            body:    function() {
		        return "<div id='scroller-bin2b' class='container-fluid p-1' " +
           		       "     style='max-height:70vh; max-width:100%; overflow:auto; -webkit-overflow-scrolling:touch;'> " +
	           	       "   <div id='compile_bin2b' " +
	           	       "        class='p-3' " +
	           	       "        style='width:100%; height: inherit !important;'> " +
			       "	<div class='d-flex align-items-center'> " +
			       "	Loading binary, please wait... <br/> " +
			       "	WARNING: loading binary might take time on slow devices. " +
			       "	</div> " +
		               "   </div> " +
		               "</div>" ;
		     },
	    buttons: {
			OK: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
    					      wsweb_dialog_close('binary_fir') ;
				           }
			     }
	             },
            size:    'extra-large',
            onshow:  function() {
                         // get binary
			 var simware = wepsim_get_binary_microcode() ;
			 if (null == simware) {
                             setTimeout(function() { wsweb_dialog_close('binary_fir'); }, 50) ;
			     return ;
			 }

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide') ;
			 wepsim_uicfg_apply() ;

                         // show binary
                         setTimeout(function() {
                                       var fhtml = firmware2html(simware.firmware, true) ;
                                       $('#compile_bin2b').html(fhtml) ;
                                       $('#bin_fir').modal('handleUpdate') ;

			               wsweb_scroll_record('#scroller-bin2b') ;
			               simcore_record_captureInit() ;
                         }, 50) ;
		     }
         },

	 // authors
         about: {
            id:      "about1",
	    title:    function() {
                          return wepsim_config_dialog_title("About WepSIM",
                                                            "secondary",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('dialogs', ws_idiom);") ;
		      },
            body:    function() {
		        return "<div id='scroller-about1' class='container-fluid p-1'" +
			       "     style='max-height:80vh; '>" +
			       "     <form>" +
			       "	<div class='form-group m-0'>" +
			       "	   <label for='about_license' class='text-secondary'>License:</label>" +
			       "	   <span class='text-primary'" +
			       "                 onclick='wepsim_help_set_relative('about#');" +
			       "                          wepsim_help_refresh();" +
			       "		          wsweb_dialog_close('about');" +
			       "			  return false;'>GNU Lesser General Public 3</span>" +
			       "	</div>" +
			       "	<div class='form-group'>" +
			       "	   <label for='about_authors' class='text-secondary'>Authors:</label>" +
			       "	   <ws-authors></ws-authors>" +
			       "	</div>" +
			       "     </form>" +
			       "</div>" ;
		     },
	    buttons: {
			OK: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
    					      wsweb_dialog_close('about') ;
				           }
			     }
	             },
            size:    '',
            onshow:  function() {
			 $('div.wsversion').replaceWith(get_cfg('version')) ;

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide');
			 wepsim_uicfg_apply() ;

			 wsweb_scroll_record('#scroller-about1') ;
			 simcore_record_captureInit() ;
		     }
         },

	 // notifications
         notifications: {
            id:       "notifications3",
	    title:    function() {
                          return wepsim_config_dialog_title("Notifications",
                                                            "secondary",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('cfg');") ;
		      },
            body:     function() {
		         var notifications      = simcore_notifications_get() ;
		         var notifications_html = table_notifications_html(notifications) ;

		         return "<div class='card border-secondary h-100'>" +
			        "<div class='card-header border-light text-secondary bg-light p-1'>" +
		                "  + <span data-langkey='Recent'>Recent</span>" +
                                "  <div class='dropdown float-right'>" +
                                "   <button class='btn btn-sm btn-outline-secondary text-danger py-1 dropdown-toggle' " +
                                "            type='button' id='resetyn' data-toggle='dropdown' " +
                                "            aria-haspopup='true' aria-expanded='false' " +
				"            ><span data-langkey='Reset'>Reset</span></button>" +
                                "   </button>" +
                                "    <div class='dropdown-menu' aria-labelledby='resetyn'>" +
                                "     <a class='dropdown-item py-2 bg-white text-danger' type='button' " +
                                "        onclick='simcore_notifications_reset(); " +
				"		  var notifications = simcore_notifications_get(); " +
				"	          var ntf_html = table_notifications_html(notifications); " +
				"		  $(\"#scroller-notifications3\").html(ntf_html); " +
				"		  // reajust ui " +
				"		  wepsim_uicfg_apply(); " +
				"		  wsweb_scroll_record(\"#scroller-notifications3\"); " +
				"		  simcore_record_captureInit(); " +
				"		  return false;'" +
                                "         ><span data-langkey='Yes'>Yes</span></a>" +
				"      <div class='dropdown-divider'></div>" +
                                "      <a class='dropdown-item py-2 bg-white text-info' type='button' " +
                                "         ><span data-langkey='No'>No</span></a>" +
                                "    </div>" +
                                "  </div>" +
			      	"</div>" +
			      	"<div class='card-body p-1'>" +
		                " <div id='scroller-notifications3' class='container-fluid p-0' " +
	           	        "      style='overflow:auto; -webkit-overflow-scrolling:touch;'> " +
                                notifications_html +
                                " </div>" +
			     	"</div>" +
			        "<div class='card-footer border-light text-secondary bg-light p-1'>" +
		                "  - <span data-langkey='Recent'>Recent</span>" +
			     	" </div>" +
			   	"</div>" ;
		      },
	    buttons:  {
			Close: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
    					       wsweb_dialog_close('notifications') ;
				           }
			       }
	             },
            size:    'large',
            onshow:  function() {
			 $("#scroller-notifications3").scrollTop(0) ;

		         // ui lang
                         var ws_idiom = get_cfg('ws_idiom') ;
			 i18n_update_tags('cfg') ;

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide');
			 wepsim_uicfg_apply() ;

			 wsweb_scroll_record('#scroller-notifications3') ;
			 simcore_record_captureInit() ;
		     }
         },

	 // examples
         examples: {
            id:      "example1",
	    title:    function() {
                          return wepsim_config_dialog_title("Examples",
                                                            "info",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('examples', ws_idiom);") ;
		      },
            body:    function() {
                        return "<div id='scroller-example1' class='container-fluid p-0' " +
                               "     style='max-height:70vh; overflow:auto; -webkit-overflow-scrolling:touch;'>" +
                               table_examples_html(ws_examples) +
                               "</div>" ;
		     },
	    buttons: {
			OK: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
    					      wsweb_dialog_close('examples') ;
				           }
			     }
	             },
            size:    'large',
            onshow:  function() {
		         // ui lang
                         var ws_idiom = get_cfg('ws_idiom') ;
                         i18n_update_tags('examples', ws_idiom) ;

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide');
			 wepsim_uicfg_apply() ;

			 wsweb_scroll_record('#scroller-example1') ;
			 simcore_record_captureInit() ;
		     }
         },

	 // config
         config: {
            id:      "config2",
	    title:    function() {
                          return wepsim_config_dialog_title("Configuration",
                                                            "primary",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('cfg', ws_idiom);") ;
		      },
            body:    function() {
                        return "<div id='scroller-config2' class='container-fluid p-0' " +
                               "     style='max-height:70vh; overflow:auto; -webkit-overflow-scrolling:touch;'>" +
			       table_config_html(ws_config) +
                               "</div>" ;
		     },
	    buttons: {
			Reset: {
			   label:     "<span data-langkey='Reset'>Reset</span>",
			   className: "btn btn-outline-info btn-sm col col-sm-3 float-left shadow-none mr-auto",
			   callback:  function() {
		         		 // reset
					 reset_cfg() ;
                               	         wepsim_notify_success('<strong>INFO</strong>',
                     					       'Configuration reset done!.') ;

		         		 // ui elements
    					 wsweb_dialog_close('config') ;
    					 wsweb_dialog_open('config') ;

					 return false ;
				      }
			},
			OK: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
    					      wsweb_dialog_close('config') ;
				           }
			     }
	             },
            size:    'large',
            onshow:  function() {
		         // ui elements
			 try
                         {
			     for (m=0; m<ws_config.length; m++)
			          ws_config[m].code_init() ;
			 }
			 catch (e) {
			     reset_cfg() ;
			     for (m=0; m<ws_config.length; m++)
			          ws_config[m].code_init() ;
                         }

			 $('a[data-toggle="popover1"]').popover({
				  placement:  'bottom',
				  trigger:    'focus, hover',
				  animation:  false,
				  delay:      { "show": 500, "hide": 100 },
				  sanitizeFn: function (content) {
						  return content ; // DOMPurify.sanitize(content) ;
					      }
			 }) ;
                         setTimeout(function() { $("#scroller-config2").scrollTop(0); }, 50);

		         // ui lang
                         var ws_idiom = get_cfg('ws_idiom') ;
                         i18n_update_tags('cfg', ws_idiom) ;

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide');
			 wepsim_uicfg_apply() ;

			 wsweb_scroll_record('#scroller-config2') ;
			 simcore_record_captureInit() ;
		     }
         },

	 // help
         help: {
            id:      "help1",
	    title:    function() {
                          return wepsim_config_dialog_title("Help",
                                                            "success",
							    "wepsim_help_refresh();" +	
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('help', ws_idiom);") ;
		      },
            body:    function() {
                        return "<div id='help1_ref' style='display:none;'></div>" +
                               "<div class='ui-body-d ui-content p-0' id='scroller-help1' " +
                               "     style='min-height:50vh; max-height:70vh; overflow-y:auto; -webkit-overflow-scrolling:touch;'>" +
			       table_helps_html(ws_help) +
                               "</div>" ;
	             },
	    buttons: {
			Index: {
			   label:     '<i class="fas fa-list"></i> ' +
                                      '<span data-langkey="Help Index">Help Index</span>',
			   className: 'btn btn-success btn-sm col col-sm-3 float-right shadow-none',
			   callback:  function() {
		         		 // ui elements
    				         wepsim_help_set_relative('') ;
					 wepsim_help_refresh();

			 		 // uicfg and events
                                         wepsim_uicfg_apply() ;
	    	 	                 simcore_record_captureInit() ;

					 return false ;
				      }
			},
			OK: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
		                              simcore_record_append_pending() ;
    					      wsweb_dialog_close('help') ;
				           }
			}
	             },
            size:    'large',
            onshow:  function() {
		         // ui elements
    			 wepsim_help_set_relative('') ;
	    		 wepsim_help_refresh();

		         // ui lang
                         var ws_idiom = get_cfg('ws_idiom') ;
                         i18n_update_tags('help', ws_idiom) ;

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide') ;
			 wepsim_uicfg_apply() ;

			 wsweb_scroll_record('#scroller-help1') ;
			 simcore_record_captureInit() ;
		     }
         },

	 rec_confirm_reset: {
			id:      'record_confirm_reset',
			title:   function() {
				     var wsi = get_cfg('ws_idiom') ;
				     return i18n_get('dialogs',wsi,'Confirm remove record...') ;
				 },
			body:    function() {
				     var wsi = get_cfg('ws_idiom') ;
				     return i18n_get('dialogs',wsi,'Close or Reset...') ;
				 },
			buttons: {
					reset: {
					   label:     "<span data-langkey='Reset'>Reset</span>",
					   className: 'btn-danger col float-left',
					   callback: function() {
							wsweb_record_reset();
							return true;
						     },
					},
					close: {
				           label:     '<i class="fa fa-times mr-2"></i>' +
					              '<span data-langkey="Close">Close</span>',
					   className: 'btn-dark col float-right'
					}
				 },
			size:    '',
			onshow:  function() {
				    // ui lang
				    var ws_idiom = get_cfg('ws_idiom') ;
				    i18n_update_tags('dialogs', ws_idiom) ;

			            simcore_record_captureInit() ;
				 }
         },

	 // state
         state: {
            id:      "current_state1",
	    title:    function() {
                          return wepsim_config_dialog_title("State",
                                                            "dark",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('dialog', ws_idiom);") ;
		      },
            body:    function() {
                        return "<div class='card mb-1'>" +
                               "  <div class='card-header text-white bg-dark p-1' id='state_header_1'>" +
                               "    <h5 class='m-0'>" +
                               "	    <a data-toggle='collapse' href='#states3'><span class='text-white bg-dark' data-langkey='Current State'>Current State</span></a>:&nbsp;" +
                               "	    <span class='btn btn-light btn-sm float-right py-0'" +
                               "		  onclick='wepsim_state_history_add();" +
                               "			   wepsim_notify_success(\"<strong>INFO</strong>\", \"Added !.\");" +
                               "			   wepsim_state_history_list();" +
                               "			   wepsim_dialog_current_state();" +
                               "			   $(\"#states3\").collapse(\"show\");" +
                               "			   return false;'" +
                               "		  data-inline='true'><span data-langkey='Add'>Add</span> <span class='d-none d-sm-inline-flex'><span data-langkey=\"'Current State' to History\">'Current State' to History</span></span></span>" +
                               "    </h5>" +
                               "  </div>" +
                               "  <div id='states3b' class='collapse show' aria-labelledby='state_header_1'>" +
                               "    <div class='card-body p-1'>" +
                               "	<div class='container-fluid ml-1 pb-0 collapse show' id='states3'" +
                               "	     style='max-height:50vh; width:inherit;'>" +
                               "" +
                               "	     <div class='row mt-2'>" +
                               "	     <div class='col-auto text-center pr-0'>" +
                               "			<strong class='m-2'>" +
                               "			    <span class='badge badge-pill border-secondary border shadow'>" +
                               "				    <a class='col-auto p-0 text-decoration-none text-reset'" +
                               "				       data-toggle='collapse' data-target='#collapse_X'" +
                               "				       target='_blank' href='#' id='curr_clk_maddr'>now</a>" +
                               "			    </span>" +
                               "			</strong>" +
                               "	     </div>" +
                               "	     <div class='col-auto text-center pr-0 ml-2'>" +
                               "			<div class='btn-group float-left' role='group' aria-label='State information for now'>" +
                               "				  <button class='btn btn-outline-dark btn-sm col-auto float-right'" +
                               "					  onclick='wepsim_clipboard_CopyFromTextarea(\"end_state1\");" +
                               "						   wepsim_state_results_empty();" +
                               "						   var curr_tag = $(\"#curr_clk_maddr\").html();" +
                               "						   $(\"#s_clip\").html(curr_tag);" +
                               "						   return false;'" +
                               "					  data-inline='true'><span data-langkey='Copy'>Copy</span><span class='d-none d-sm-inline-flex'>&nbsp;<span data-langkey='to clipboard'>to clipboard</span></span></button>" +
                               "				  <button class='btn btn-outline-dark btn-sm col-auto float-right'" +
                               "					  onclick='var txt_chklst1 = get_clipboard_copy();" +
                               "						   var obj_exp1    = simcore_simstate_checklist2state(txt_chklst1);" +
                               "						   var txt_chklst2 = $(\"#end_state1\").val();" +
                               "						   var obj_exp2    = simcore_simstate_checklist2state(txt_chklst2);" +
                               "						   var ref_tag     = $(\"#curr_clk_maddr\").html();" +
                               "						   $(\"#s_ref\").html(ref_tag);" +
                               "						   wepsim_dialog_check_state(obj_exp1, obj_exp2);" +
                               "						   $(\"#check_results_scroll1\").collapse(\"show\");'" +
                               "					  type='button'><span data-langkey='Check'>Check</span> <span class='d-none d-md-inline-flex'><span data-langkey='differences with clipboard state'>differences with clipboard state</span></span></button>" +
                               "				  <button class='btn btn-outline-dark btn-sm col-auto float-right'" +
                               "					  data-toggle='collapse' data-target='#collapse_X'>&plusmn; <span data-langkey='Show'>Show</span></button>" +
                               "			</div>" +
                               "	     </div>" +
                               "	     </div>" +
                               "" +
                               "	     <div class='row'" +
                               "		  style='max-height:40vh; width:inherit; overflow:auto; -webkit-overflow-scrolling:touch;'>" +
                               "	     <div class='col p-1'>" +
                               "		<div id='collapse_X' class='mt-2 collapse show'>" +
                               "			<form id='end_state_form1'" +
                               "			      class='form-horizontal mb-2'" +
                               "			      style='white-space:wrap; overflow-y:auto; -webkit-overflow-scrolling:touch; width:100%;'>" +
                               "			   <label class='my-0' for='end_state1'>state:</label>" +
                               "			   <textarea aria-label='current_state'" +
                               "				     placeholder='Default...'" +
                               "				     id='end_state1'" +
                               "				     name='end_state1'" +
                               "				     data-allowediting='true'" +
                               "				     data-allowpasting='false'" +
                               "				     data-limit='0'" +
                               "				     data-createtokensonblur='false'" +
                               "				     data-delimiter=';'" +
                               "				     data-beautify='true'" +
                               "				     class='form-control input-xs'" +
                               "				     rows='5'></textarea>" +
                               "			</form>" +
                               "		</div>" +
                               "	     </div>" +
                               "	     </div>" +
                               "" +
                               "	</div>" +
                               "    </div>" +
                               "  </div>" +
                               "</div>" +
                               "" +
                               "<div class='card mb-1'>" +
                               "  <div class='card-header text-white bg-dark p-1' id='state_header_2'>" +
                               "    <h5 class='m-0'>" +
                               "	  <a data-toggle='collapse' href='#history3'><span class='text-white bg-dark' data-langkey='History'>History</span></a>:&nbsp;" +
                               "" +
                               "	  <div class='dropdown float-right'>" +
                               "	    <button class='btn btn-sm btn-light text-danger py-0 mx-1 float-right col-auto dropdown-toggle' " +
                               "		    type='button' id='resetyn2' data-toggle='dropdown' " +
                               "		    aria-haspopup='true' aria-expanded='false' " +
                               "		    ><span data-langkey='Reset'>Reset</span><span class='d-none d-sm-inline-flex'>&nbsp;<span data-langkey='history'>history</span></span></button>" +
                               "	    </button>" +
                               "	    <div class='dropdown-menu' aria-labelledby='resetyn2'>" +
                               "	     <a class='dropdown-item py-2 bg-white text-danger' type='button' " +
                               "	        onclick='wepsim_state_history_reset();" +
                               "		         wepsim_notify_success(\"<strong>INFO</strong>\", \"Removed all !.\");" +
                               "		         wepsim_state_history_list() ;" +
                               "		         return false;'" +
                               "		 ><span data-langkey='Yes'>Yes</span></a>" +
                               "	      <div class='dropdown-divider'></div>" +
                               "	      <a class='dropdown-item py-2 bg-white text-info' type='button' " +
                               "		 ><span data-langkey='No'>No</span></a>" +
                               "	    </div>" +
                               "	  </div>" +
                               "" +
                               "    </h5>" +
                               "  </div>" +
                               "  <div id='history3b' class='collapse show' aria-labelledby='state_header_2'>" +
                               "    <div class='card-body p-1'>" +
                               "	<div class='container-fluid ml-1 pb-2 collapse show' id='history3'" +
                               "	     style='max-height:40vh; width:inherit; overflow:auto; -webkit-overflow-scrolling:touch;'>" +
                               "	     <div id='history1'>" +
                               "		  <div class='pt-2'></div>" +
                               "		  <span style='background-color:#FCFC00'>&lt;<span data-langkey='Empty history'>Empty history</span>&gt;</span>" +
                               "	     </div>" +
                               "	</div>" +
                               "    </div>" +
                               "  </div>" +
                               "</div>" +
                               "" +
                               "<div class='card mb-1'>" +
                               "  <div class='card-header text-white bg-dark p-1' id='state_header_3'>" +
                               "    <h5 class='m-0'>" +
                               "	    <a data-toggle='collapse' href='#check_results_scroll1'><span class='text-white bg-dark' data-langkey='Differences'>Differences</span></a>:" +
                               "	    <span class='btn btn-light btn-sm float-right py-0'" +
                               "		  onclick='wepsim_clipboard_CopyFromDiv(\"check_results_scroll1\");" +
                               "			   return false;'" +
                               "		  data-inline='true'>" +
                               "		  <span data-langkey='Copy'>Copy</span>" +
                               "		  <span class='d-none d-sm-inline-flex'>&nbsp;<span data-langkey='to clipboard'>to clipboard</span></span>" +
                               "	    </span>" +
                               "    </h5>" +
                               "  </div>" +
                               "  <div id='check_results_scroll1b' class='collapse show' aria-labelledby='state_header_3'>" +
                               "    <div class='card-body p-1'>" +
                               "	<div class='container-fluid ml-1 pb-2 collapse show' id='check_results_scroll1'" +
                               "	     style='max-height:40vh; width:inherit; overflow-y:auto; -webkit-overflow-scrolling:touch;' >" +
                               "	     <div class='row align-items-center'>" +
                               "	     <div class='col-auto text-center flex-column d-flex pr-0'>" +
                               "		  <span id='s_clip' class='badge badge-pill border-secondary border m-2 shadow'>clipboard</span>" +
                               "		  <div class='row' style='max-height:16vh'><div class='col border-right border-dark'>&nbsp;</div><div class='col'>&nbsp;</div></div>" +
                               "		  <span id='s_ref'  class='badge badge-pill border-secondary border m-2 shadow'>reference</span>" +
                               "	     </div>" +
                               "	     <div class='col py-2 pl-2'>" +
                               "		  <div id='check_results1'>" +
                               "		       <span style='background-color:#FCFC00'>&lt;<span data-langkey='Empty (only modified values are shown)'>Empty (only modified values are shown)</span>&gt;</span>" +
                               "		  </div>" +
                               "	     </div>" +
                               "	     </div>" +
                               "	</div>" +
                               "    </div>" +
                               "  </div>" +
                               "</div>" ;
	             },
	    buttons: {
			OK: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
    					      wsweb_dialog_close('state') ;
				           }
			}
	             },
            size:    'large',
            onshow:  function() {
                         if (simhw_active() !== null)
                         {
		             // update state
		             $('#end_state1').tokenfield({ inputType: 'textarea' }) ;
		                //A1/ var inputEls = document.getElementById('end_state1');
		                //A1/ if (null !== inputEls)
		                //A1/     setup_speech_input(inputEls) ;

                             wepsim_state_history_list() ;
                             wepsim_dialog_current_state() ;
                         }

		         // ui lang
                         var ws_idiom = get_cfg('ws_idiom') ;
                         i18n_update_tags('states', ws_idiom) ;

			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide') ;
			 wepsim_uicfg_apply() ;

	    	 	 simcore_record_captureInit() ;
		     }
         },

	 current_checkpoint: {
		id:      'current_checkpoint1',
		title:   function() {
                             return wepsim_config_dialog_title("Checkpoint",
                                                               "secondary",
							       "var ws_idiom = get_cfg('ws_idiom');" +
							       "i18n_update_tags('dialog', ws_idiom);") ;
			 },
		body:    function() {
                             return "<div class='row m-0'>" +
                                    "   <div class='col-12 col-sm-4 p-2'>" +
                                    "   <div class='card border-secondary h-100'>" +
                                    "      <div class='card-header border-secondary text-white bg-secondary p-1'>" +
                                    "	  <h5 class='m-0'>" +
                                    "	    <span class='text-white bg-secondary' data-langkey='Output'>Output</span>" +
                                    "	    <button class='btn btn-light mx-1 float-right py-0 col-auto'" +
                                    "		  onclick='wepsim_notify_success(\"<strong>INFO</strong>\", \"Processing save request...\");" +
                                    "			   var obj_tagName   = document.getElementById(\"tagToSave1\") ;" +
                                    "			   var checkpointObj = wepsim_checkpoint_get(obj_tagName.value);" +
                                    "			   wepsim_checkpoint_save(\"FileNameToSaveAs1\", \"tagToSave1\", checkpointObj);" +
                                    "			   wsweb_dialog_close(\"current_checkpoint\");" +
                                    "			   return false;'><span data-langkey='Save'>Save</span></button>" +
                                    "	    <button class='btn btn-light mx-1 float-right py-0 col-auto'" +
                                    "		  onclick=' wepsim_notify_success(\"<strong>INFO</strong>\", \"Processing share request...\");" +
                                    "			   var obj_tagName   = document.getElementById(\"tagToSave1\") ;" +
                                    "			   var checkpointObj = wepsim_checkpoint_get(obj_tagName.value);" +
                                    "			   wepsim_checkpoint_share(\"FileNameToSaveAs1\", \"tagToSave1\", checkpointObj);" +
                                    "			   wsweb_dialog_close(\"current_checkpoint\");" +
                                    "			   return false;'><span data-langkey='Share'>Share</span></button>" +
                                    "	  </h5>" +
                                    "      </div>" +
                                    "      <div class='card-body'>" +
                                    "		<label for='FileNameToSaveAs1' class='collapse7'><em><span data-langkey='File name'>File name</span>:</em></label>" +
                                    "		<p><input aria-label='filename to save content' id='FileNameToSaveAs1'" +
                                    "			  class='form-control btn-outline-dark' placeholder='File name where checkpoint will be saved' style='min-width: 90%;'/></p>" +
                                    "" +
                                    "		<label for='tagToSave1' class='collapse7'><em><span data-langkey='Tag for checkpoint'>Tag for checkpoint</span>:</em></label>" +
                                    "		<p><input aria-label='associated tag to be saved' id='tagToSave1'" +
                                    "			  class='form-control btn-outline-dark' placeholder='Associated tag to be saved (if any)' style='min-width: 90%;'/></p>" +
                                    "      </div>" +
                                    "   </div>" +
                                    "   </div>" +
                                    "   <div class='col-12 col-sm-4 p-2'>" +
                                    "   <div class='card border-secondary h-100'>" +
                                    "      <div class='card-header border-secondary text-white bg-secondary p-1'>" +
                                    "	  <h5 class='m-0'>" +
                                    "	    <span class='text-white bg-secondary' data-langkey='Input' class='collapse7'>Input</span>" +
                                    "	    <button class='btn btn-light mx-1 float-right py-0 col-auto'" +
                                    "		    onclick='var ret = wepsim_checkpoint_load(\"FileNameToSaveAs1\", \"tagToSave1\", \"fileToLoad31\");" +
                                    "			     if (ret) {" +
                                    "				 wsweb_dialog_close(\"current_checkpoint\");" +
                                    "				 wepsim_notify_success(\"<strong>INFO</strong>\", \"Processing load request...\");" +
                                    "			     }" +
                                    "			     return false;'><span data-langkey='Load'>Load</span></button>" +
                                    "	  </h5>" +
                                    "      </div>" +
                                    "      <div class='card-body'>" +
                                    "		<label for='fileToLoad31' class='collapse7'><em><span data-langkey='File to be loaded'>File to be loaded</span>:</em><br></label>" +
                                    "		<input data-max-height='20vh'" +
                                    "		       aria-label='file to load' type='file' id='fileToLoad31' class='dropify' />" +
                                    "      </div>" +
                                    "   </div>" +
                                    "   </div>" +
                                    "   <div class='col-12 col-sm-4 p-2'>" +
                                    "   <div class='card border-secondary h-100'>" +
                                    "      <div class='card-header border-secondary text-white bg-secondary p-1'>" +
                                    "	  <h5 class='m-0'>" +
                                    "	    <span class='text-white bg-secondary' data-langkey='Browser cache'>Browser cache</span>" +
                                    "	    <button class='btn btn-light mx-1 float-right py-0 col-auto'" +
                                    "		    onclick='var ret = wepsim_checkpoint_loadFromCache(\"FileNameToSaveAs1\", \"tagToSave1\", \"browserCacheElto\");" +
                                    "			     wsweb_dialog_close(\"current_checkpoint\");" +
                                    "			     if (ret.error)" +
                                    "				  wepsim_notify_success(\"<strong>INFO</strong>\", ret.msg);" +
                                    "			     else wepsim_notify_success(\"<strong>INFO</strong>\", \"Processing load request...\");" +
                                    "			     return false;'><span data-langkey='Load'>Load</span></button>" +
                                    "		  <div class='dropdown float-right'>" +
                                    "		    <button class='btn btn-light text-danger py-0 mx-1 float-right col-auto dropdown-toggle' " +
                                    "			    type='button' id='resetyn2' data-toggle='dropdown' " +
                                    "			    aria-haspopup='true' aria-expanded='false' " +
                                    "			    ><span data-langkey='Reset'>Reset</span></button>" +
                                    "		    </button>" +
                                    "		    <div class='dropdown-menu' aria-labelledby='resetyn2'>" +
                                    "		     <a class='dropdown-item py-2 bg-white text-danger' type='button' " +
                                    "			onclick='wepsim_checkpoint_clearCache();" +
                                    "				 wepsim_checkpoint_listCache(\"browserCacheList1\");" +
                                    "				 return false;'" +
                                    "			 ><span data-langkey='Yes'>Yes</span></a>" +
                                    "		      <div class='dropdown-divider'></div>" +
                                    "		      <a class='dropdown-item py-2 bg-white text-info' type='button' " +
                                    "			 ><span data-langkey='No'>No</span></a>" +
                                    "		    </div>" +
                                    "		  </div>" +
                                    "	  </h5>" +
                                    "      </div>" +
                                    "      <div class='card-body'>" +
                                    "		<label for='browserCacheList1' class='collapse7'><em><span data-langkey='Session to be restore'>Session to be restore</span>:</em><br></label>" +
                                    "		<div id='browserCacheList1'" +
                                    "		     style='max-height:40vh; width:inherit; overflow:auto; -webkit-overflow-scrolling:touch;'>&lt;Empty&gt;</div>" +
                                    "      </div>" +
                                    "   </div>" +
                                    "   </div>" +
                                    "</div>" ;

			 },
		buttons: {
			     close: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
    					      wsweb_dialog_close('current_checkpoint') ;
				           }
			     }
			 },
		size:    'extra-large',
		onshow:  function() {
                                 // update content
	                         wepsim_checkpoint_listCache('browserCacheList1');
			         $('.dropify').dropify() ;
				 $('#current_checkpoint1').modal('handleUpdate') ;

				 // ui lang
				 var ws_idiom = get_cfg('ws_idiom') ;
				 i18n_update_tags('dialog', ws_idiom) ;

				 // uicfg and events
				 $('[data-toggle=tooltip]').tooltip('hide') ;
				 wepsim_uicfg_apply() ;

				 simcore_record_captureInit() ;
			 }
         },

	 // reload
         reload: {
            id:      "reload1",
	    title:    function() {
                          return wepsim_config_dialog_title("Reload",
                                                            "danger",
							    "var ws_idiom = get_cfg('ws_idiom');" +
							    "i18n_update_tags('dialogs', ws_idiom);") ;
		      },
            body:    function() {
                       var card_configuration_btns = function ( ) {
                             var o = '' ;
			     var e_cfgs = cfgset_getSet() ;
			     for (var e_cfg in e_cfgs) {
				  o += '<button type="button" ' +
				       '    class="text-danger btn border-secondary m-1" ' +
				       '    onclick="cfgset_load(\'' + e_cfg + '\') ;' +
				       '	     wepsim_notify_success(\'<strong>INFO</strong>\',' +
				       '	  		           \'Configuration loaded!.\') ;' +
				       '	     wepsim_uicfg_restore() ;' +
				       '	     return false;">' +
                                       '<span data-langkey="' + e_cfg + '">' + e_cfg + '</span>' +
                                       '</button>' ;
			     }
                             return o ;
                                      } ;
                       var card_example_btns = function ( ) {
                             var o = '' ;
			     var e_exs = wepsim_example_getSet() ;
			     for (var i in e_exs) {
				  o += '<button type="button" ' +
				       '    class="text-danger btn border-secondary m-1" ' +
				       '    onclick="wepsim_example_reset() ;' +
				       '	     wepsim_example_load(\'' + e_exs[i].name + '\') ;' +
				       '	     wepsim_notify_success(\'<strong>INFO</strong>\',' +
				       '			           \'Examples list loaded!.\') ;' +
				       '	     return false;">' +
                                       '<span data-langkey="' +e_exs[i].name+ '">' + e_exs[i].name + '</span>' +
                                       '</button>' ;
			     }
                             return o ;
                                      } ;
                       var card_processor_btns = function ( ) {
                             var o = '' ;
                             var e_hws = simhw_hwset_getSet() ;
			     for (var e_hw in e_hws) {
				  o += '<button type="button" ' +
				       '    class="text-danger btn border-secondary m-1" ' +
				       '    onclick="wepsim_reload_hw(\'' + e_hw + '\') ;' +
				       '	     wepsim_notify_success(\'<strong>INFO</strong>\', ' +
				       '			          \'' + e_hw +' processor loaded!.\') ;'+
				       '	     return false;">' + e_hw.toUpperCase() + '</button>' ;
			     }
                             return o ;
                                      } ;

                        // cards
                        var elements = [
                                 {
                                    "name": "Configuration",
                                    "icon": "<em class='fas fa-cogs pr-2'></em>",
                                    "function": card_configuration_btns
                                 },
                                 {
                                    "name": "Examples",
                                    "icon": "<em class='fas fa-stream pr-2'></em>",
                                    "function": card_example_btns
                                 },
                                 {
                                    "name": "Processor",
                                    "icon": "<em class='fas fa-microchip pr-2'></em>",
                                    "function": card_processor_btns
                                 }
                            ] ;

		        var o = '<div id="scroller-reload1" class="row m-0">' ;
                        for (var e in elements) {
                             var ename = elements[e].name ;
			     o += '<div class="col-12 col-sm-4 p-2">' +
				  '<div class="card border-secondary h-100">' +
				  '<div class="card-header border-secondary text-white bg-secondary p-1 text-center">' +
				  '<h5 class="py-1 m-0">' +
				  elements[e].icon +
                                  '<span data-langkey="' + ename + '">' + ename + '</span>' +
                                  '</h5>' +
				  '</div>' +
			          ' <div class="card-body">' +
			          ' <div class="btn-group-vertical w-100" role="group" aria-label="' +ename+ '">' +
                                  elements[e].function() +
				  ' </div>' +
				  ' </div>' +
				  '</div>' +
				  '</div>' ;
                        }
                        o += '</div>' ;

		        return o ;
		     },
	    buttons: {
			OK: {
				label:     '<i class="fa fa-times mr-2"></i>' +
					   '<span data-langkey="Close">Close</span>',
			        className: "btn btn-primary btn-sm col col-sm-3 float-right shadow-none",
			        callback:  function() {
    					      wsweb_dialog_close('reload') ;
				           }
			     }
	             },
            size:    'large',
            onshow:  function() {
			 // uicfg and events
			 $('[data-toggle=tooltip]').tooltip('hide');
			 wepsim_uicfg_apply() ;

			 wsweb_scroll_record('#scroller-reload1') ;
			 simcore_record_captureInit() ;
		     }
         }

    } ;

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


    //
    // WepSIM quickcfg
    //

    wsweb_quickcfg = {

         pop1: {
            quick_id:     '#po1',
	    val_trigger:  'manual',
	    fun_content:  function() {
				var wsi = get_cfg('ws_idiom') ;

				var o = '<ul class="list-group list-group-flush">' ;

				   o += '<li class="list-group-item px-0"> ' +
					'  <a class="btn btn-sm btn-outline-dark col p-1 text-left float-right" href="#" ' +
					'     onclick="wsweb_dialog_open(\'about\'); ' +
					'              wsweb_quickmenu_close(); ' +
					'              return false;">' +
					'<em class="fas fa-magic col-1 pl-1 float-left"></em>' +
					'<span class="col-11">' + i18n_get('dialogs',wsi,'About WepSIM') + '...</span></a>' +
					'</li>' ;

				   o += '<li class="list-group-item px-0"> ' +
					'  <a class="btn btn-sm btn-outline-dark col p-1 text-left float-right" href="#" ' +
					'     onclick="wepsim_newbie_tour(); ' +
					'              wsweb_quickmenu_close(); ' +
					'              return false;">' +
					'<em class="fas fa-book-reader col-1 pl-1 float-left"></em>' +
					'<span class="col-11">' + i18n_get('dialogs',wsi,'Initial intro') + '...</span></a>' +
					'</li>' ;

				   o += '<li class="list-group-item px-0"> ' +
					'  <span class="btn-group-toggle" data-toggle="buttons">' +
					'  <label class="btn btn-sm btn-outline-dark col p-1 text-left float-right" data-toggle="collapse" href=".multi-collapse-3">' +
					'  <input type="checkbox" checked="" autocomplete="off">' +
					'<em class="fas fa-wrench col-1 pl-1 float-left"></em>' +
					'<span class="col-11">' + i18n_get('dialogs',wsi,'Show/Hide QuickConfig') + '</span></label>' +
					'  </span>' +
					'</li>' ;

				   o += '<li class="list-group-item px-0"> ' +
					'  <span class="btn-group-toggle" data-toggle="buttons">' +
					'  <label class="btn btn-sm btn-outline-dark col p-1 text-left float-right" data-toggle="collapse" href=".multi-collapse-1">' +
					'  <input type="checkbox" checked="" autocomplete="off">' +
					'<em class="fas fa-bars col-1 pl-1 float-left"></em>' +
					'<span class="col-11">' + i18n_get('dialogs',wsi,'Show/Hide ActionBar') + '</span></label>' +
					'  </span>' +
					'</li>' ;

				   o += '<li class="list-group-item px-0"> ' +
					'  <span class="btn-group-toggle" data-toggle="buttons">' +
					'  <label class="btn btn-sm btn-outline-dark col p-1 text-left float-right" data-toggle="collapse" href=".multi-collapse-2">' +
					'  <input type="checkbox" checked="" autocomplete="off">' +
					'<em class="fas fa-sliders-h col-1 pl-1 float-left"></em>' +
					'<span class="col-11">' + i18n_get('dialogs',wsi,'Show/Hide Slider') + '</span></label>' +
					'  </span>' +
					'</li>' ;

				   o += '<button type="button" id="close" data-role="none" ' +
					'        class="btn btn-sm btn-danger w-100 p-0 mt-2" ' +
					'        onclick="wsweb_quickmenu_close(); ' +
					'                 return false;">' +
					i18n_get('dialogs',wsi,'Close') +
					'</button>' +
					'</ul>' ;

				return o ;
                          },
	    fun_ownshown: function() { }
         },

         slidercfg: {
            quick_id:     '#popover-slidercfg',
	    val_trigger:  'click',
	    fun_content:  function() {
		var wsi = get_cfg('ws_idiom') ;

		var o = '<ul class="list-group list-group-flush">' ;

		   o += '<li class="list-group-item px-0"> ' +
			'     <div id="slider_cpucu" class="col-sm p-0 collapse show user_microcode">' +
			'           <form id="slider2f" class="full-width-slider row-auto mt-0 p-0 pt-0 pb-2">' +
			'                <label class="my-0" for="slider3b" style="min-width:95%"><span data-langkey="processor">processor</span>:</label>' +
			'                <input aria-label="Show CPU/CU" type="range" name="slider3b" id="slider3b"' +
			'                       min="0" max="14" value="7" step="1"' +
			'                       data-show-value="false"' +
			'                       class="custom-range slider col mx-0 px-0"' +
			'                       oninput="wsweb_set_cpucu_size(this.value) ;' +
			'                                return false;">' +
			'           </form>' +
			'     </div>' +
			'</li>' ;

		   o += '<li class="list-group-item px-0"> ' +
			'     <div class="col-sm p-0 ml-1 collapse show">' +
			'           <form id="slider2e" class="full-width-slider row-auto mt-0 p-0 pt-0 pb-2">' +
			'                <label class="my-0" for="slider3a" style="min-width:95%"><span data-langkey="details">details</span>:</label>' +
			'                <input aria-label="Show Main/Info" type="range" name="slider3a" id="slider3a"' +
			'                       min="0" max="14" value="7" step="1"' +
			'                       data-show-value="false"' +
			'                       class="custom-range slider col mx-0 px-0"' +
			'                       oninput="wsweb_set_c1c2_size(this.value) ;' +
			'                                return false;">' +
			'           </form>' +
			'     </div>' +
			'</li>' ;

		   o += '<li class="list-group-item px-0"> ' +
			'<label><span data-langkey="dark mode">dark mode</span>:</label>' +
			"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >" +
			"        <label id='label18-true'" +
			"               class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' " +
			"               aria-label='WepSIM dark mode: true' " +
			"               onclick=\"wepsim_restore_darkmode(true) ; " +
			"                         update_cfg('ws_skin_dark_mode', true);" +
			"                         return false;\">" +
			"            <input type='radio' name='options' id='radio18-true'  aria-label='Dark mode: true'  autocomplete='off' >On" +
			"        </label>" +
			"        <label id='label18-false'" +
			"               class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' " +
			"               aria-label='WepSIM dark mode: true' " +
			"               onclick=\"wepsim_restore_darkmode(false) ; " +
			"                         update_cfg('ws_skin_dark_mode', false);" +
			"                         return false;\">" +
			"            <input type='radio' name='options' id='radio18-false' aria-label='Dark mode: false' autocomplete='off' >Off" +
			"        </label>" +
			"    </div>" +
			'</li>' ;

		   o += '<li class="list-group-item px-0"> ' +
			'<label class="w-100"><span data-langkey="Reload">Reload</span>...:</label>' +
			"   <div class='btn btn-sm btn-light btn-outline-dark w-50 p-1' " +
			"        aria-label='open the reload dialog box' " +
			"        onclick=\"wsweb_quickslider_close(); " +
			"                  wsweb_dialog_open('reload'); " +
			"                  return false;\">" +
                        "<i class='fas fa-redo'></i>&nbsp;<span data-langkey='Reload'>Reload</span></div>" +
			'</li>' ;

/*
		   o += '<li class="list-group-item px-0"> ' +
			'<label><span data-langkey="beginner view">beginner view</span>:</label>' +
			"<div class='btn-group btn-group-toggle d-flex' data-toggle='buttons' >" +
			"        <label id='label17-true'" +
			"               class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' " +
			"               aria-label='Frequent only: true' " +
			"               onclick=\"wepsim_activeview('only_frequent', true) ; " +
			"                         return false;\">" +
			"            <input type='radio' name='options' id='radio17-true'  aria-label='Frequent only: true'  autocomplete='off' >On" +
			"        </label>" +
			"        <label id='label17-false'" +
			"               class='btn btn-sm btn-light w-50 btn-outline-secondary p-1' " +
			"               aria-label='Frequent only: true' " +
			"               onclick=\"wepsim_activeview('only_frequent', false) ; " +
			"                         return false;\">" +
			"            <input type='radio' name='options' id='radio17-false' aria-label='Frequent only: false' autocomplete='off' >Off" +
			"        </label>" +
			"    </div>" +
			'</li>' ;
*/

		   o += '<button type="button" id="close" data-role="none" ' +
			'        class="btn btn-sm btn-danger w-100 p-0 mt-3" ' +
			'        onclick="wsweb_quickslider_close(); ' +
			'                 return false;">' +
			i18n_get('dialogs',wsi,'Close') +
			'</button>' +
			'</ul>' ;

		return o ;
                          },
	    fun_ownshown: function(shownEvent) {
				    var optValue = false ;
				    $("#slider3a").val(get_cfg('C1C2_size')) ;
				    $("#slider3b").val(get_cfg('CPUCU_size')) ;
				    optValue = (get_cfg('ws_skin_user').split(":")[1] == 'on') ? true : false ;
                                    $('#label16-' + optValue).button('toggle') ;
				    optValue = (get_cfg('ws_skin_user').split(":")[3] == 'on') ? true : false ;
                                    $('#label17-' + optValue).button('toggle') ;
				    optValue = get_cfg('ws_skin_dark_mode') ;
                                    $('#label18-' + optValue).button('toggle') ;
                          }
         },

         popover2: {
            quick_id:     '[data-toggle=popover2]',
	    val_trigger:  'click',
	    fun_content:  function(shownEvent) {
			      return wepsim_show_asm_columns_checked('popover2_asm') ;
		          },
	    fun_ownshown: function(shownEvent) {
			      showhideAsmHeader() ;
                          }
         }

    } ;

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


    //
    // WepSIM API
    //

    //  To change Workspaces

    var hash_skin2action = {
	    "classic": {
		         "simulator": function() {
					  sim_change_workspace('#main1', 0) ;

					  setTimeout(function(){
							 $("#t3_firm").appendTo("#t3_firm_placeholder2") ;
							  $("#t4_asm").appendTo("#t4_asm_placeholder2") ;
							 inputfirm.refresh() ;
							 inputasm.refresh() ;
						     }, 50) ;
	                              },
		         "microcode": function() {
		                          sim_change_workspace('#main3', 1) ;

			                  setTimeout(function(){
					                 $("#t3_firm").appendTo("#t3_firm_placeholder1") ;
					                 inputfirm.refresh() ;
				                     }, 50) ;
	                              },
		         "assembly":  function() {
					  sim_change_workspace('#main4', 2) ;

					  setTimeout(function(){
							 $("#t4_asm").appendTo("#t4_asm_placeholder1") ;
							 inputasm.refresh() ;
						     }, 50) ;
	                              }
		       },
	    "compact": {
		         "simulator": function() {
	                                  $("#nav-simulation-tab").click() ;
	                              },
		         "microcode": function() {
	                                  $("#nav-microcode-tab").click() ;
	                              },
		         "assembly":  function() {
	                                  $("#nav-assembly-tab").click() ;
	                              }
		       }
        } ;

    function wsweb_change_workspace_simulator ( )
    {
	    var skin_ui = get_cfg('ws_skin_ui') ;

            if (typeof hash_skin2action[skin_ui] !== "undefined") {
                hash_skin2action[skin_ui].simulator() ;
	    }

	    // stats about ui
	    setTimeout(function(){
		           ga('send', 'event', 'ui', 'ui.workspace', 'ui.workspace.simulator');
		       }, 50) ;

            // add if recording
            simcore_record_append_new('Change to workspace simulator',
		                      'wsweb_change_workspace_simulator();\n') ;

            // return ok
            return true ;
    }

    function wsweb_change_workspace_microcode ( )
    {
	    var skin_ui = get_cfg('ws_skin_ui') ;

            if (typeof hash_skin2action[skin_ui] !== "undefined") {
                hash_skin2action[skin_ui].microcode() ;
	    }

	    // stats about ui
	    setTimeout(function(){
			   ga('send', 'event', 'ui', 'ui.workspace', 'ui.workspace.microcode');
		       }, 50) ;

            // add if recording
            simcore_record_append_new('Change to workspace microcode',
		                      'wsweb_change_workspace_microcode();\n') ;

            // return ok
            return true ;
    }

    function wsweb_change_workspace_assembly ( )
    {
	    var skin_ui = get_cfg('ws_skin_ui') ;

            if (typeof hash_skin2action[skin_ui] !== "undefined") {
                hash_skin2action[skin_ui].assembly() ;
	    }

	    // stats about ui
	    setTimeout(function(){
			   ga('send', 'event', 'ui', 'ui.workspace', 'ui.workspace.assembly');
		       }, 50) ;

            // add if recording
            simcore_record_append_new('Change to workspace assembly',
	       	                      'wsweb_change_workspace_assembly();\n') ;

            // return ok
            return true ;
    }

    function wsweb_change_show_processor ( )
    {
            var id_arr = [ 'svg_p', 'svg_cu', 'svg_p2' ] ;
            var o = null ;
            var a = null ;

	    $("#tab26").tab('show') ;
            if (simhw_active() !== null)
            {
                // reload svg (just in case)
                for (var i in id_arr) 
                {
                         o = document.getElementById(id_arr[i]) ;
                     if (o === null) continue ;
                     a = o.getAttribute('data') ;
                         o.setAttribute('data', a) ;
                }

                // start drawing again
	        wepsim_svg_start_drawing() ;
	        refresh() ;
            }

            // add if recording
            simcore_record_append_new('Show processor details',
		                      'wsweb_change_show_processor();\n') ;

            // return ok
            return true ;
    }

    function wsweb_change_show_asmdbg ( )
    {
	    $("#tab24").tab('show') ;
            if (simhw_active() !== null)
            {
                wepsim_svg_stop_drawing() ;

                // if code then move scroll
	        var o1 = fullshow_asmdbg_pc() ;
	        if (null === o1) {
	            return true ;
                }

	        var obj_byid = $('#asm_debugger_container') ;
                if (typeof obj_byid === 'undefined') {
                    return true ;
                }

                if ( (typeof o1 !== 'undefined') && (typeof o1[0] !== 'undefined') ) {
	              obj_byid[0].scrollTop = o1[0].offsetTop ;
                }
            }

            // add if recording
            simcore_record_append_new('Show assembly debugger',
		                      'wsweb_change_show_asmdbg();\n') ;

            // return ok
            return true ;
    }

    //  Workspace simulator: execution

    function wsweb_execution_reset ( )
    {
            if (simhw_active() !== null)
            {
	        wepsim_execute_reset(true, true) ;
	        simcoreui_show_hw() ;
            }

            // add if recording
            simcore_record_append_new('Reset',
		                      'wsweb_execution_reset();\n') ;

            // return ok
            return true ;
    }

    function wsweb_execution_microinstruction ( )
    {
            if (simhw_active() !== null)
            {
	        wepsim_execute_microinstruction() ;
	        simcoreui_show_hw() ;
            }

            // add if recording
            simcore_record_append_new('Execute microinstruction',
		                      'wsweb_execution_microinstruction();\n') ;

            // return ok
            return true ;
    }

    function wsweb_execution_instruction ( )
    {
            if (simhw_active() !== null)
            {
	        wepsim_execute_instruction() ;
	        simcoreui_init_hw('#config_HW') ;
            }

            // add if recording
            simcore_record_append_new('Execute instruction',
		                      'wsweb_execution_instruction();\n') ;

            // return ok
            return true ;
    }

    function wsweb_execution_run ( )
    {
            if (simhw_active() !== null)
            {
                var mode = get_cfg('ws_mode') ;
	        wepsim_execute_toggle_play('#btn_run_stop') ;
            }

            // add if recording
            simcore_record_append_new('Run',
		                      'wsweb_execution_run();\n') ;

            // intercept events...
	    $("#current_state2").one("hidden.bs.modal",
		                     function () {
					 simcore_record_append_new('Close execution summary',
						                   'wsweb_dialogbox_close_all();\n');
				     });

            // return ok
            return true ;
    }

    //  Workspace simulator: dialog-boxes

    function wsweb_dialog_open ( dialog_id )
    {
	    // check params
	    if (typeof wsweb_dialogs[dialog_id] === "undefined") {
                return null ;
            }

	    // open dialog
            var d1 = wsweb_dlg_open(wsweb_dialogs[dialog_id]) ;

            // intercept events...
	    d1.one("hidden.bs.modal",
		    function () {
			wsweb_dialog_close(dialog_id) ;
		    });

            // add if recording
            simcore_record_append_new('Open dialogbox ' + dialog_id,
		                      'wsweb_dialog_open("' + dialog_id + '");\n') ;

	    // stats about ui
            ga('send', 'event', 'ui', 'ui.dialog', 'ui.dialog.' + wsweb_dialogs[dialog_id].id) ;

	    // return dialog
	    return d1 ;
    }

    function wsweb_dialog_close ( dialog_id )
    {
	    // check params
	    if (typeof wsweb_dialogs[dialog_id] === "undefined") {
                return null ;
            }

	    // close dialog
            var d1 = wsweb_dlg_close(wsweb_dialogs[dialog_id]) ;

            // add if recording
            simcore_record_append_new('Close dialogbox ' + dialog_id,
		                      'wsweb_dialog_close("' + dialog_id + '");\n') ;

	    // return dialog
	    return d1 ;
    }

    function wsweb_dialogbox_close_all ( )
    {
	    // Close all dialogbox
	    wsweb_dialog_close('help') ;
	    wsweb_dialog_close('config') ;
	    wsweb_dialog_close('examples') ;
	    wsweb_dialog_close('state') ;
	    wsweb_dialog_close('current_checkpoint') ;
	    $('#current_state2').modal('hide') ;

            // add if recording
            simcore_record_append_new('Close all dialogboxes',
		                      'wsweb_dialogbox_close_all();\n') ;

            // return ok
            return true ;
    }

    //  Workspace simulator: Signal dialog

    var hash_signal2action = {
	    "<all>":  function(key, event_type){ wsweb_dialogbox_open_updatesignal(key, event_type); },
        } ;

    function wsweb_dialogbox_open_updatesignal ( key, event_type )
    {
	    // update interface
            if (false === get_cfg('is_interactive')) {
                return true;
            }

	    if ( (true === get_cfg('is_quick_interactive')) && (event_type == 'click') ) 
            {
	          wepsim_update_signal_quick(key) ;
	          show_states();
                  wepsim_show_rf_values();

                  // return ok
                  return true ;
            }

            // add if recording
            simcore_record_append_new('Open update signal dialogbox for ' + key,
                                      'wepsim_update_signal_dialog(\'' + key + '\');\n') ;

            wepsim_update_signal_dialog(key) ;
	    show_states();
            wepsim_show_rf_values();

            // intercept events...
	    $("#dlg_updatesignal").one("hidden.bs.modal",
		                       function () {
					  simcore_record_append_new('Close update signal dialog',
						                    'wsweb_dialogbox_close_updatesignal();\n') ;
				       });

            // return ok
            return true ;
    }

    function wsweb_dialogbox_close_updatesignal ( )
    {
	    $('#dlg_updatesignal').modal('hide') ;

            // add if recording
            simcore_record_append_new('Close update signal dialogbox',
		                      'wsweb_dialogbox_close_updatesignal();\n') ;

            // return ok
            return true ;
    }

    //  Workspace simulator: Selects

    function wsweb_set_details_select ( opt )
    {
	    // update interface
	    $('#tab'  + opt).trigger('click') ;
	    $('#select5a').val(opt) ;

	    // set button label...
	    var ed=$('#s5b_' + opt).html() ;
	    $('#select5b').html(ed) ;

            // add if recording
            simcore_record_append_new('Change select details to ' + opt,
		                      'wsweb_set_details_select(' + opt + ');\n') ;

            // return ok
            return true ;
    }

    var hash_detail2action = {
	    "CLOCK":          function(){ wepsim_execute_microinstruction(); },
	    "REGISTER_FILE":  function(){ wsweb_set_details_select(11); wepsim_show_rf_values(); },
	    "CONTROL_MEMORY": function(){ wsweb_set_details_select(16); show_memories_values(); },
	    "CPU_STATS":      function(){ wsweb_set_details_select(17); show_memories_values(); },
	    "MEMORY":         function(){ wsweb_set_details_select(14); show_memories_values(); },
	    "MEMORY_CONFIG":  function(){ wsweb_set_details_select(18); show_memories_values(); },
	    "KEYBOARD":       function(){ wsweb_set_details_select(12); show_memories_values(); },
	    "SCREEN":         function(){ wsweb_set_details_select(12); show_memories_values(); },
	    "IO_STATS":       function(){ wsweb_set_details_select(15); show_memories_values(); },
	    "IO_CONFIG":      function(){ wsweb_set_details_select(19); show_memories_values(); },
	    "3DLED":          function(){ wsweb_set_details_select(25); show_memories_values(); },

	    "FRM_EDITOR":     function(){ wsweb_set_details_select(20); $("#t3_firm").appendTo("#t3_firm_placeholder2"); inputfirm.refresh(); },
	    "ASM_EDITOR":     function(){ wsweb_set_details_select(21);  $("#t4_asm").appendTo("#t4_asm_placeholder2");   inputasm.refresh(); },
	    "HARDWARE":       function(){ wsweb_set_details_select(22);
					  $('[data-toggle=tooltip]').tooltip('hide');
					  simcoreui_init_hw('#config_HW') ;
					  var ws_idiom = get_cfg('ws_idiom');
					  i18n_update_tags('gui', ws_idiom) ;
                                        }
        } ;

    function wsweb_set_details ( opt )
    {
            if ( 
              (simhw_active() !== null) && 
              (typeof hash_detail2action[opt] !== "undefined") 
            )
            {
                hash_detail2action[opt]() ;
            }

            // add if recording
            simcore_record_append_new('Set details to ' + opt,
		                      'wsweb_set_details(\'' + opt + '\');\n') ;

            // return ok
            return true ;
    }

    function wsweb_select_refresh ( )
    {
            if (simhw_active() !== null)
            {
	        wepsim_show_rf_values() ;
		show_memories_values() ;
		wepsim_reset_max_turbo() ;
		$('[data-toggle=tooltip]').tooltip('hide') ;
            }

            // add if recording
            simcore_record_append_new('Refresh in selection',
		                      'wsweb_select_refresh();\n') ;

            // return ok
            return true ;
    }

    //  Workspace simulator: Mode

    function wsweb_select_main ( opt )
    {
	    // save ws_mode
	    set_cfg('ws_mode', opt) ;
	    save_cfg() ;

	    // update select4
	    wepsim_mode_change(opt) ;

	    // tutorial mode -> set green background...
	    $('#select4').css('background-color', '#F6F6F6') ;

	    // set button label...
	    var ed = $('#s4_' + opt).html() ;
	    $('#select4').html(ed) ;

	    // adapt to idiom
	    var ws_idiom = get_cfg('ws_idiom') ;
	    i18n_update_tags('gui', ws_idiom) ;

            // add if recording
            simcore_record_append_new('Set main work mode to ' + opt,
		                      'wsweb_select_main("' + opt + '");\n') ;

            // return ok
            return true ;
    }

    function wsweb_do_action ( opt )
    {
	    switch (opt)
	    {
	        case 'examples':
		      wsweb_dialog_open('examples') ;
		      break ;

	        case 'checkpoint':
		      wsweb_dialog_open('current_checkpoint') ;
		      break ;

	        case 'notifications':
		      wsweb_dialog_open('notifications') ;
		      break ;

	        case 'recordbar':
		      wsweb_recordbar_toggle() ;
		      break ;

	        case 'reload':
		      wsweb_dialog_open('reload') ;
		      break ;

	        case 'help':
		      wsweb_dialog_open('help') ;
		      break ;

	        case 'intro':
		      wsweb_select_main('intro') ;
		      setTimeout(wsweb_record_play, 1000) ;
		      break ;

	        case 'hw_summary':
		      wsweb_dialog_open('help') ;
		      wepsim_open_help_hardware_summary() ;
		      break ;
	    }

	    return false;
    }

    function wsweb_select_action ( opt )
    {
	    // save ws_action
	    set_cfg('ws_action', opt) ;
	    save_cfg() ;

	    // set button label...
	    var ed = $('#selact_' + opt).html() ;
	    $('.select6').html(ed) ;
	    $('#select6a').attr('data-action', opt) ;

	    // adapt to idiom
	    var ws_idiom = get_cfg('ws_idiom') ;
	    i18n_update_tags('gui', ws_idiom) ;

	    // do action
	    wsweb_do_action(opt) ;

            // return ok
            return true ;
    }

    //  Workspace simulator: Sliders

    function wsweb_set_cpucu_size ( new_value )
    {
            var int_value = parseInt(new_value, 10) ;

	    $('#slider2b').val(new_value) ;
	    set_ab_size('#eltos_cpu_a', '#eltos_cpu_b', int_value) ;

	    set_cfg('CPUCU_size', int_value) ;
	    save_cfg() ;

            // add if recording
            simcore_record_append_new('Set cpu-cu size to ' + new_value,
		                      'wsweb_set_cpucu_size(' + new_value + ');\n') ;

            // return ok
            return true ;
    }

    function wsweb_set_c1c2_size ( new_value )
    {
            var int_value = parseInt(new_value, 10) ;

	    $("#slider2a").val(new_value) ;
	    set_ab_size('#col1', '#col2', int_value) ;

	    set_cfg('C1C2_size', int_value) ;
	    save_cfg() ;

            // add if recording
            simcore_record_append_new('Set c1-c2 size to ' + new_value,
		                      'wsweb_set_c1c2_size(' + new_value + ');\n') ;

            // return ok
            return true ;
    }

    //  Workspace simulator: Compile

    function wsweb_assembly_compile ( )
    {
            if (false == inputfirm.is_compiled) 
            {
		wsweb_dlg_alert('The Microcode is not microcompiled.<br>\n' +
	   	   	        'Please load a Microcode first in memory in order to used it.');
                return false ;
            }

            var textToCompile = inputasm.getValue() ;
	    var ok = wepsim_compile_assembly(textToCompile) ;
            inputasm.is_compiled = ok ;

            // add if recording
            simcore_record_append_new('Compile assembly',
		                      'wsweb_assembly_compile();\n') ;

            // return ok
            return true ;
    }

    function wsweb_firmware_compile ( )
    {
	    var textToMCompile = inputfirm.getValue();
	    var ok = wepsim_compile_firmware(textToMCompile);
            inputfirm.is_compiled = ok ;

            // if microcode changed -> recompile assembly
            inputasm.is_compiled = false ;
	    var o = '<div class=\'card m-3 border\'><div class=\'card-body m-1\'>' +
		    'Please remember that after updates on the microcode, the assembly code has be re-compiled too.' +
		    '</div></div>' ;
	    $('#asm_debugger').html(o);

            // add if recording
            simcore_record_append_new('Compile firmware',
		                      'wsweb_firmware_compile();\n') ;

            // return ok
            return true ;
    }

    //  Workspace simulator: Files

    function wsweb_save_controlmemory_to_file ( )
    {
            var wsi = get_cfg('ws_idiom') ;

            var q = i18n_get('dialogs',wsi,'Sure Control Memory...') + '\n\n' ;
            if (confirm(q))
	    {
	        var SIMWARE = get_simware() ;
	        var simware_as_text = saveFirmware(SIMWARE);
	        if (simware_as_text.trim() == '') {
		    wsweb_dlg_alert('The Microcode loaded in memory is empty!<br>\n' +
	   	   	            'Please load a Microcode first in memory in order to save it.');
                }
	        else inputfirm.setValue(simware_as_text);

	        var fileNameToSaveAs = document.getElementById('inputFileNameToSaveAs').value;
	        var textToWrite      = inputfirm.getValue();
	        wepsim_save_to_file(textToWrite, fileNameToSaveAs);
	    }

            // add if recording
            simcore_record_append_new('Save control memory to file',
		                      'wsweb_save_controlmemory_to_file();\n') ;

            // return ok
            return true ;
    }

    //  Workspace simulator: record

    function wsweb_record_on ( )
    {
	    simcore_record_start() ;

	    // stats about recordbar
	    ga('send', 'event', 'recordbar', 'recordbar.action', 'recordbar.action.record');

            // return ok
            return true ;
    }

    function wsweb_record_off ( )
    {
	    simcore_record_stop() ;

	    // stats about recordbar
	    ga('send', 'event', 'recordbar', 'recordbar.action', 'recordbar.action.stop');

            // return ok
            return true ;
    }

    function wsweb_record_reset ( )
    {
	    simcore_record_reset() ;

	    // stats about recordbar
	    ga('send', 'event', 'recordbar', 'recordbar.action', 'recordbar.action.reset');

            // return ok
            return true ;
    }

    function wsweb_record_play ( )
    {
	    simcore_record_play() ;

	    // stats about recordbar
	    ga('send', 'event', 'recordbar', 'recordbar.action', 'recordbar.action.play');

            // return ok
            return true ;
    }

    function wsweb_record_pause ( )
    {
	    simcore_record_pause() ;

	    // stats about recordbar
	    ga('send', 'event', 'recordbar', 'recordbar.action', 'recordbar.action.pause');

            // return ok
            return true ;
    }

    function wsweb_record_playInterval ( from, to )
    {
	    simcore_record_playInterval(from, to) ;

	    // stats about recordbar
	    ga('send', 'event', 'recordbar', 'recordbar.action', 'recordbar.action.play-' + from + '-' + to);

            // return ok
            return true ;
    }

    function wsweb_record_confirmReset ( )
    {
	    // show dialogbox
            wsweb_dlg_open(wsweb_dialogs.rec_confirm_reset) ;

            // return ok
            return true ;
    }


    //
    //  All workspaces: popovers and modals from quick-menu...
    //

    // quick menu
    function wsweb_quickmenu_show ( )
    {
	    $('#po1').popover('show') ;
	    wepsim_uicfg_apply() ;

            // add if recording
            simcore_record_append_new('Open the "quick menu"',
		                      'wsweb_quickmenu_show();\n') ;

            // return ok
            return true ;
    }

    function wsweb_quickmenu_close ( )
    {
	    $('#po1').popover('hide') ;

            // add if recording
            simcore_record_append_new('Close the "quick menu"',
		                      'wsweb_quickmenu_close();\n') ;

            // return ok
            return true ;
    }

    function wsweb_quickmenu_toggle ( )
    {
	    $('#po1').popover('toggle') ;
	    wepsim_uicfg_apply() ;

            // add if recording
            simcore_record_append_new('Toggle the "quick menu"',
		                      'wsweb_quickmenu_toggle();\n') ;

            // return ok
            return true ;
    }

    // quick slider(s)
    function wsweb_quickslider_show ( )
    {
	    $('#popover-slidercfg').popover('show') ;

            // add if recording
            simcore_record_append_new('Open the "quick slider"',
		                      'wsweb_quickslider_show();\n') ;

            // return ok
            return true ;
    }

    function wsweb_quickslider_close ( )
    {
	    $('#popover-slidercfg').popover('hide') ;

            // add if recording
            simcore_record_append_new('Close the "quick slider"',
		                      'wsweb_quickslider_close();\n') ;

            // return ok
            return true ;
    }

    function wsweb_quickslider_toggle ( )
    {
	    $('#popover-slidercfg').popover('toggle') ;

            // add if recording
            simcore_record_append_new('Toggle the "quick slider"',
		                      'wsweb_quickslider_toggle();\n') ;

            // return ok
            return true ;
    }

    // recordbar
    function wsweb_recordbar_show ( )
    {
	    $('#record_div').collapse('show') ;

            // add if recording
            simcore_record_append_new('Open the "record toolbar"',
		                      'wsweb_recordbar_show();\n') ;

            // return ok
            return true ;
    }

    function wsweb_recordbar_toggle ( )
    {
	    $('#record_div').collapse('toggle') ;

            // add if recording
            simcore_record_append_new('Toggle the "record toolbar"',
		                      'wsweb_recordbar_toggle();\n') ;

            // return ok
            return true ;
    }

    function wsweb_recordbar_close ( )
    {
	    $('#record_div').collapse('hide') ;

            // add if recording
            simcore_record_append_new('Close the "record toolbar"',
		                      'wsweb_recordbar_close();\n') ;

            // return ok
            return true ;
    }


    //
    // Auxiliar functions
    //

    // timer

    var wepsim_updatediv_timer = null ;

    function wepsim_updatetime ( div_id, time_left_sec )
    {
            $(div_id).html('<span>Close automatically after ' + time_left_sec + ' seconds.</span>') ;

            wepsim_updatediv_timer = setTimeout(wepsim_updatetime, 1000, div_id, (time_left_sec - 1));
    }

    function wepsim_updatetime_start ( div_id, time_left_sec )
    {
            clearTimeout(wepsim_updatediv_timer) ;

            wepsim_updatetime(div_id, time_left_sec) ;
    }


    //  simulator: notify

    var wsweb_nfbox = null ;

    function wsweb_notifyuser_show ( title, message, duration )
    {
	    // check params
	    if (title.trim() === '') {
		title = '&lt;empty title&gt;' ;
	    }
	    if (message.trim() === '') {
		message = '&lt;empty message&gt;' ;
	    }

            // dialog
	    var dlg_obj = {
		             id:         'notifyuser1',
		             title:      function() { return title; },
		             body:       function() {
                                            return "<div class='p-2 m-0' style='word-wrap:break-word;'>" +
		                                   message +
		                                   "</div>" ;
                                         },
		             onshow:     function(e) {
	                                    wepsim_updatetime_start("#autoclose1", duration / 1000) ;
                                         },
		             buttons:    {
					    noclose: {
					        label: "<div id='autoclose1'>&nbsp;</div>",
					        className: 'float-left mr-auto m-0',
					        callback: function() {
					   		     return false;
						          }
					    },
					    cancel: {
					        label: "<span data-langkey='Close'>Close</span>",
					        className: 'btn-danger m-0',
					        callback: function() {
					   		     clearTimeout(wepsim_updatediv_timer) ;
							     wsweb_record_play();
						          }
					    }
		                         },
		             size:       'large'
	             } ;
	    wsweb_nfbox = wsweb_dlg_open(dlg_obj) ;

            // return ok
            return true ;
    }

    function wsweb_notifyuser_hide ( )
    {
	    wsweb_nfbox.modal("hide") ;

            // return ok
            return true ;
    }

    function wsweb_notifyuser_add ( )
    {
	    // check if recording
            if (simcore_record_isRecording() === false) {
		return true ;
	    }

	    // stats about recordbar
	    ga('send', 'event', 'recordbar', 'recordbar.action', 'recordbar.action.add_notification');

	    // build the message box
            var wsi = get_cfg('ws_idiom') ;
            var bbbt = {} ;

            bbbt.cancel = {
		    label: i18n_get('gui',wsi,'Close'),
		    className: 'btn-danger col float-left mr-auto',
	    };
            bbbt.end = {
		    label: i18n_get('gui',wsi,'Save'),
		    className: 'btn-success col float-right',
		    callback: function() {
			    // get values
			    var nf_title    = $("#frm_title1").val() ;
			    var nf_message  = $("#frm_message1").val() ;
			    var nf_duration = $("#frm_duration1").val() ;

			    // post-process
			    var w_title    = nf_title.replace(/<[^>]*>/g, '') ;
			    var s_title    = '<span class=\'inline-block text-truncate w-25\'>' + w_title   + '</span>' ;

			    var w_message  = nf_message.replace(/<[^>]*>/g, '') ;
			    var s_message  = '<span class=\'inline-block text-truncate w-25\'>' + w_message + '</span>' ;
			    var c_message = w_message.replace(new RegExp('\r?\n','g'), '</br>') ;

			    var w_duration = parseInt(nf_duration) ;
			    if (isNaN(w_duration))
			         w_duration = 5000 ;
			    else w_duration = 1000 * w_duration ;

			    // add if recording
			    simcore_record_setTimeBeforeNow(500) ;
			    simcore_record_append_new('Show message with title "'  + s_title + '" and body "' + s_message + '".',
						      'wsweb_notifyuser_show("'    + w_title + '", "'         + c_message + '", "' + w_duration + '");\n') ;
			    simcore_record_setTimeBeforeNow(w_duration) ;
			    simcore_record_append_new('Close message with title "' + s_title + '".',
				                      'wsweb_notifyuser_hide();\n') ;
		    }
	    };

	    var bbmsg = '<div class="container">' +
		        '<label for="frm_title1"><em>'    + i18n_get('dialogs',wsi,'Title') + ':</em></label>' +
			'<p><input aria-label="title" id="frm_title1" ' +
			'	  class="form-control btn-outline-dark" placeholder="Title for the notification" style="min-width: 90%;"/></p>' +
		        '<label for="frm_message1"><em>'  + i18n_get('dialogs',wsi,'Message') + ':</em></label>' +
			'<p><textarea aria-label="message" id="frm_message1" rows="5" ' +
			'	      class="form-control btn-outline-dark" placeholder="Message for the notification" style="min-width: 90%;"/></p>' +
		        '<label for="frm_duration1"><em>' + i18n_get('dialogs',wsi,'Duration') + ':</em></label>' +
			'<p><input aria-label="duration" id="frm_duration1" type="number" ' +
			'	  class="form-control btn-outline-dark" placeholder="Duration for the notification in seconds" style="min-width: 90%;"/></p>' +
		        '</div>' ;

            // dialog
            var dlg_obj = {
			     id:       'notifuseradd1',
			     title:    function() { return 'Form to add a message during playback...' ; },
			     body:     function() { return bbmsg ; },
			     buttons:  bbbt,
			     onshow:   function() { },
			     size:     "large"
                          } ;
            wsweb_nfbox = wsweb_dlg_open(dlg_obj) ;

            // return ok
            return true ;
    }

    // scroll in Div

    var wsweb_scroll_timer = null;

    function wsweb_scroll_to ( div_id, div_pos )
    {
	    var div_obj = $(div_id) ;
	    div_obj.scrollTop(div_pos) ;
    }

    function wsweb_scroll_record ( container_id )
    {
	    var container_obj = $(container_id) ;
	    var add_scroll_to = function() {
				     var div_pos = container_obj.scrollTop() ;
				     simcore_record_append_new('Scroll content',
						               'wsweb_scroll_to("' + container_id + '", ' + div_pos + ');\n') ;
				};

            container_obj.scroll(function() {

				    if (wsweb_scroll_timer !== null) {
					clearTimeout(wsweb_scroll_timer) ;
				    }

				    wsweb_scroll_timer = setTimeout(add_scroll_to, 100);
				 });
    }

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


    //
    // WepSIM API
    //

    /*
     *  Editor
     */

    function sim_cfg_editor_theme ( editor )
    {
	    var theme = get_cfg('editor_theme') ;

	    editor.getWrapperElement().style['text-shadow'] = '0.0em 0.0em';
	    editor.getWrapperElement().style['font-weight'] = 'bold';

	    if (theme === 'blackboard') {
		editor.getWrapperElement().style['font-weight'] = 'normal';
	    }

	    editor.setOption('theme', theme);
    }

    function sim_cfg_editor_mode ( editor )
    {
	    var edt_mode = get_cfg('editor_mode');

	    if (edt_mode === 'vim') {
		editor.setOption('keyMap','vim');
            }
	    if (edt_mode === 'emacs') {
		editor.setOption('keyMap','emacs');
            }
	    if (edt_mode === 'sublime') {
		editor.setOption('keyMap','sublime');
            }
    }

    function sim_init_editor ( editor_id, editor_cfg )
    {
	    var editor_obj = CodeMirror.fromTextArea(document.getElementById(editor_id), editor_cfg) ;

            // default values
	    editor_obj.setValue("\n\n\n\n\n\n\n\n\n\n");

            sim_cfg_editor_theme(editor_obj) ;
            sim_cfg_editor_mode(editor_obj) ;

            editor_obj.setSize("auto","auto");
            editor_obj.refresh();

            // event onChange
	    editor_obj.is_modified = true ;
	    editor_obj.is_compiled = false ;

            editor_obj.on("change",
                          function (cmi, change) {
                             cmi.is_modified = true ;
                             cmi.is_compiled = false ;
                          }) ;

	    return editor_obj ;
    }


    /*
     *  Dialogs
     */

    // Error dialog

    function goError ( editor, pos )
    {
         editor.setCursor({ line: pos-1, ch: 0 }) ;
         var marked = editor.addLineClass(pos-1, 'background', 'CodeMirror-selected') ;
         setTimeout(function(){ 
			editor.removeLineClass(marked, 'background', 'CodeMirror-selected'); 
                    }, 3000) ;

   	 var t = editor.charCoords({line: pos, ch: 0}, 'local').top ;
   	 var middleHeight = editor.getScrollerElement().offsetHeight / 2 ;
   	 editor.scrollTo(null, t - middleHeight - 5) ;
    }

    function showError ( Msg, editor )
    {
            var errorMsg = Msg.replace(/\t/g,' ').replace(/   /g,' ');

            var pos = errorMsg.match(/Problem around line \d+/);
            var lineMsg = '' ;
            if (null !== pos) {
                pos = parseInt(pos[0].match(/\d+/)[0]);
                lineMsg += '<button type="button" class="btn btn-danger" ' +
                           '        onclick="wepsim_notify_close(); ' +
                           '                 goError(' + editor + ', ' + pos + ');">' +
                           ' Go line ' + pos +
                           '</button>&nbsp;' ;
            }

            wepsim_notify_error('<strong>ERROR</strong>',
                                errorMsg + '<br>' + '<center>' + lineMsg +
                                '<button type="button" class="btn btn-danger" ' +
                                '        onclick="wepsim_notify_close();"><span data-langkey="Close">Close</span></button>' +
                                '</center>') ;
    }

    // Show binaries

    function wepsim_get_binary_code ( )
    {
         // compile if needed
	 if (false == inputasm.is_compiled) 
         {
	     var textToCompile = inputasm.getValue() ;
	     var ok = wepsim_compile_assembly(textToCompile) ;
	     inputasm.is_compiled = ok ;
	 }

         // update content
         if (false == inputfirm.is_compiled)
         {
             if (inputfirm.getValue().trim() !== "") {
                 var wsi = get_cfg('ws_idiom') ;
                 var msg = i18n_get('gui', wsi, 'Microcode or Assembly are not compiled properly') ;
	         setTimeout(function(){ wsweb_dlg_alert(msg + '.<br>\n') ; }, 50);
             }

             return null ;
	 }
         if (false == inputasm.is_compiled) {
             return null ;
	 }

	 return get_simware() ;
    }

    function wepsim_get_binary_microcode ( )
    {
         // microcompile if needed
	 if (false == inputfirm.is_compiled)
	 {
	     var textToMCompile = inputfirm.getValue() ;
	     var ok = wepsim_compile_firmware(textToMCompile) ;
	     inputfirm.is_compiled = ok ;
	      inputasm.is_compiled = false ;
	 }

         // update content
	 if (false == inputfirm.is_compiled) {
	     return null ;
	 }

	 return get_simware() ;
    }


    /*
     * Microcompile and compile
     */

    function wepsim_compile_assembly ( textToCompile )
    {
        // get SIMWARE.firmware
        var SIMWARE = get_simware() ;
	if (SIMWARE.firmware.length === 0)
        {
            wsweb_dlg_alert('WARNING: please load the microcode first.');
            sim_change_workspace('#main3') ;
            return false;
	}

        // compile Assembly and show message
        var SIMWAREaddon = simlang_compile(textToCompile, SIMWARE);
        if (SIMWAREaddon.error != null)
        {
            showError(SIMWAREaddon.error, "inputasm") ;
            return false;
        }

        wepsim_notify_success('<strong>INFO</strong>',
                              'Assembly was compiled and loaded.') ;

        // update memory and segments
        set_simware(SIMWAREaddon) ;
	update_memories(SIMWARE);

        // update UI
        var asmdbg_content = assembly2html(SIMWAREaddon.mp,  SIMWAREaddon.labels2,
                                           SIMWAREaddon.seg, SIMWAREaddon.assembly) ;
	asmdbg_loadContent(asmdbg_content) ;

	simcore_reset();
        return true;
    }

    function wepsim_compile_firmware ( textToMCompile )
    {
	var ret = simcore_compile_firmware(textToMCompile) ;
	if (false === ret.ok)
        {
            showError(ret.msg, "inputfirm") ;
            return false;
        }

        // update UI
        wepsim_notify_success('<strong>INFO</strong>',
                              'Microcode was compiled and loaded.') ;

	simcore_reset() ;
        return true;
    }

/*
 *  Copyright 2015-2020 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


    // workspaces

    function sim_change_workspace ( page_id, carousel_id )
    {
            if ( (typeof $.mobile                             != "undefined") &&
                 (typeof $.mobile.pageContainer               != "undefined") &&
                 (typeof $.mobile.pageContainer.pagecontainer != "undefined") )
            {
                  $.mobile.pageContainer.pagecontainer('change', page_id);
            }
            else
            {
                  $('#carousel-8').carousel(carousel_id) ;
            }
    }

    // active/restore UI

    function wepsim_uicfg_apply ( )
    {
	    var cfgValue = null ;

	    // view
	    cfgValue = get_cfg('ws_skin_user') ;
	    wepsim_restore_view(cfgValue) ;

	    // dark mode
	    cfgValue = get_cfg('ws_skin_dark_mode') ;
            wepsim_restore_darkmode(cfgValue) ;
    }

    function wepsim_uicfg_restore ( )
    {
	    // Reload UIcfg
	    wepsim_uicfg_apply() ;

	    // Reload view
	    wsweb_change_workspace_simulator() ;
	    wsweb_change_show_processor() ;
	    wsweb_set_details('REGISTER_FILE') ;

	    wsweb_set_cpucu_size(get_cfg('CPUCU_size')) ;
	    wsweb_set_c1c2_size(get_cfg('C1C2_size')) ;
    }

    function wepsim_activeview ( view, is_set )
    {
            // update current skin
	    var cur_skin_user = get_cfg('ws_skin_user').split(":") ;

	    if ('only_asm' === view)
	    {
	        cur_skin_user[0] = 'only_asm' ;
	        cur_skin_user[1] = (is_set) ? 'on' : 'of' ;
	    }
	    if ('only_frequent' === view)
	    {
	        cur_skin_user[2] = 'only_frequent' ;
	        cur_skin_user[3] = (is_set) ? 'on' : 'of' ;
	    }

            // update cfg
	    var new_skin_user = cur_skin_user.join(":") ;
	    update_cfg('ws_skin_user', new_skin_user) ;
	    $('#label14-' + new_skin_user.replace(/:/g,"__")).button('toggle');

            // update view
            wepsim_restore_view(new_skin_user) ;
    }

    function wepsim_restore_view ( view )
    {
            var new_classes = [] ;
	    var cur_skin_user = view.split(":") ;
	    if ('only_asm' === cur_skin_user[0])
	    {
              //$(".multi-collapse-2").collapse("show") ;
		inputfirm.setOption('readOnly', false) ;

	        if ('on' === cur_skin_user[1])
                {
		     $("#tab24").click() ;
		     inputfirm.setOption('readOnly', true) ;
		     new_classes.push('.user_microcode') ;
		}
	    }
	    if ('only_frequent' === cur_skin_user[2])
	    {
	        if ('on' === cur_skin_user[3])
		    new_classes.push('.user_archived') ;
	    }

	    var classes = '.user_archived, .user_microcode' ;
	    $(classes).removeClass('d-none') ;
            classes = new_classes.join(", ") ;
            $(classes).addClass('d-none') ;
    }

    function wepsim_restore_darkmode ( adm )
    {
	    var o = null ;

            // body
	    o = document.getElementsByTagName('body') ;
	    if (o.length > 0)
            {
	         if (adm === false)
	              o[0].removeAttribute('data-theme', 'dark') ;
	         else o[0].setAttribute('data-theme',    'dark') ;
            }

            // skipped elements
	    o = document.querySelectorAll('.no-dark-mode') ;
            for (var i=0; i<o.length; i++)
            {
	         if (adm === false)
	              o[i].removeAttribute('data-theme', 'nodark') ;
	         else o[i].setAttribute('data-theme',    'nodark') ;
            }

	    return true ;
    }


    // hardware reload

    function wepsim_reload_hw ( p_name )
    {
         // try to load
         var ret = simhw_hwset_load(p_name) ;
         if (false === ret) {
             return false ;
         }

         // select the loaded one
	 wsweb_select_main(p_name) ;
         return true ;
    }

    // wepsim_activehw: UI handlers

    var msg_default = '<div class="bg-warning"><b>Not available in this hardware</b></div>' ;

    var hash_detail2init = {

	    "REGISTER_FILE":  {
						  init: function() {
							     $('#states_ALL').html(msg_default) ;
							     wepsim_init_states('#states_ALL') ;

							     $('#states_BR').html(msg_default) ;
							     wepsim_init_rf('#states_BR') ;
							},
						 reset: function() {
							     wepsim_show_states() ;
							     wepsim_show_rf_values();
							     wepsim_show_rf_names();
							},
					   show_states: wepsim_show_states,
					show_rf_values: wepsim_show_rf_values,
					 show_rf_names: wepsim_show_rf_names
	                      },

	    "CPU_STATS":      {
						  init: function() {
							   var o = document.getElementById("cpu1") ;
							   if (typeof o !== "undefined") o.render(msg_default) ;
						        },
						 reset: function() {
							   return true ;
						        }
	                      },
	
	    "CONTROL_MEMORY": {
						  init: function() {
							   return true ;
						        },
						 reset: function() {
							   show_control_memory(simhw_internalState('MC'),
									       simhw_internalState('MC_dashboard'),0,true);
						        },
					   update_draw: wepsim_svg_update_draw,
			         update_bus_visibility: wepsim_svg_update_bus_visibility
	                      },
	
	    "MEMORY":         {
		                                  init: function() {
							   return true ;
						        },
						 reset: function() {
							   show_main_memory(simhw_internalState('MP'), 0, true, false) ;
						        },
		                      show_main_memory: wepsim_show_main_memory,
		                        show_asmdbg_pc: wepsim_show_asmdbg_pc,
                                   show_control_memory: wepsim_show_control_memory,
		                          show_dbg_mpc: wepsim_show_dbg_mpc,
				           show_dbg_ir: wepsim_show_dbg_ir
	                      },

	    "MEMORY_CONFIG":  {
						  init: function() {
							   var o = document.getElementById("memcfg1") ;
							   if (typeof o !== "undefined") o.render(msg_default) ;
						        },
						 reset: function() {
						           return true ;
						        }
	                      },

	    "IO_STATS":       {
						  init: function() {
							   var o = document.getElementById("ioinfo1") ;
							   if (typeof o !== "undefined") o.render(msg_default) ;
						        },
						 reset: function() {
						           return true ;
						        }
	                      },

	    "IO_CONFIG":      {
						  init: function() {
							   var o = document.getElementById("iocfg1") ;
							   if (typeof o !== "undefined") o.render(msg_default) ;
						        },
						 reset: function() {
						           return true ;
						        }
	                      },

	    "3DLED":         {
						  init: function() {
							   var o = document.getElementById("l3d1") ;
							   if (typeof o !== "undefined") o.render(msg_default) ;
						        },
						 reset: function() {
						           return true ;
						        }
	                      },

	    "SCREEN":         {
		                                  init: function() {
						           return true ;
						        },
		                                 reset: function() {
			                                   wepsim_set_screen_content("") ;
	                                                },
		                    get_screen_content: wepsim_get_screen_content,
                                    set_screen_content: wepsim_set_screen_content
	                      },

	    "KEYBOARD":       {
		                                  init: function() {
						           return true ;
						         },
		                                 reset: function() {
						           return true ;
						        },
		                  get_keyboard_content: wepsim_get_keyboard_content,
                                  set_keyboard_content: wepsim_set_keyboard_content
	                      }
	} ;

    function wepsim_activehw ( mode )
    {
	    simhw_setActive(mode) ;

            // reload images
	    var o = document.getElementById('svg_p') ;
	    if (o != null) o.setAttribute('data',  simhw_active().sim_img_processor) ;
	        o = document.getElementById('svg_cu') ;
	    if (o != null) o.setAttribute('data', simhw_active().sim_img_controlunit) ;
	        o = document.getElementById('svg_p2') ;
	    if (o != null) o.setAttribute('data', simhw_active().sim_img_cpu) ;

            // reload images event-handlers
	    var a = document.getElementById("svg_p");
	    a.addEventListener("load",function() {
		simcore_init_eventlistener("svg_p", hash_detail2action, hash_signal2action) ;
		refresh() ;
	    }, false);

	    var b = document.getElementById("svg_cu");
	    b.addEventListener("load",function() {
		simcore_init_eventlistener("svg_cu", hash_detail2action, hash_signal2action) ;
		refresh() ;
	    }, false);

	    // initialize hw UI
	    simcore_init_ui(hash_detail2init) ;
	    simcoreui_init_hw('#config_HW') ;

            // info + warning
	    wepsim_notify_warning('<strong>WARNING</strong>',
                                  'Please remember the current firmware and assembly might need to be reloaded, ' +
                                  'because previous working session of the simulated hardware are not kept.') ;
	    wepsim_notify_success('<strong>INFO</strong>',
                                  '"' + simhw_active().sim_name + '" has been activated.') ;

            // update UI: memory
            var SIMWARE = get_simware() ;
    	    update_memories(SIMWARE) ;
            simcore_reset() ;

            // update UI: asmdbg
            var asmdbg_content = default_asmdbg_content_horizontal() ;
	    for (var l in SIMWARE.assembly) // <===> if (SIMWARE.assembly != {})
	    {
                 asmdbg_content = assembly2html(SIMWARE.mp, SIMWARE.labels2, SIMWARE.seg, SIMWARE.assembly) ;
		 break ;
	    }

	    asmdbg_loadContent(asmdbg_content) ;

            // return ok
            return true ;
    }

    // sliders

    function set_ab_size ( diva, divb, new_value )
    {
        // reset
	var colclass = "col-1 col-2 col-3 col-4 col-5 col-6 col-7 col-8 col-9 col-10 col-11 col-12 " + 
                       "order-1 order-2 d-none" ;
	$(diva).removeClass(colclass) ;
	$(divb).removeClass(colclass) ;

        // set
        switch (new_value)
        {
           case 0:    $(diva).addClass('col-12 order-1') ;
                      $(divb).addClass('col-12') ;
                      break ;
           case 1:    $(diva).addClass('d-none') ;
                      $(divb).addClass('col-12 order-2') ;
                      break ;
           case 13:   $(diva).addClass('col-12 order-1') ;
                      $(divb).addClass('d-none') ;
                      break ;
           case 14:   $(diva).addClass('col-12') ;
                      $(divb).addClass('col-12 order-2') ;
                      break ;
           default:   $(diva).addClass('col-' + (new_value-1)) ;   //  1,  2, 3, ...
                      $(divb).addClass('col-' + (13-new_value)) ;  // 11, 10, 9, ...
                      break ;
        }
    }

    //
    // Auxiliar function
    //

    // confirm exit
    function wepsim_confirm_exit ( e )
    {
	    wepsim_checkpoint_addCurrentToCache() ;

	    var confirmationMessage = "\o/";
	    (e || window.event).returnValue = confirmationMessage; // Gecko + IE
	    return confirmationMessage;                            // Webkit, Safari, Chrome
    }

    // alert reload
    function wepsim_general_exception_handler ( err )
    {
          alert("Please try to cleanup the browser cache and try again.\n" +
                "WepSIM was improperly used and found an error, sorry :-(\n" +
		"\n" +
		"Diagnostic:\n" +
                " * Error message: " + err.message + "\n" +
		" * Runtime stack:\n" + err.stack +
		"\n" +
		"After close this alert, WepSIM will try to reload and by-pass the cache (just in case).\n") ;

	  location.reload(true) ;
    }


    //
    // Quick Config
    //

    // popover quick-slidercfg
    function wepsim_init_quickcfg ( quick_id, val_trigger, fun_content, fun_ownshown )
    {
	 return $(quick_id).popover({
		    trigger:     val_trigger,
		    html:        true,
		    placement:  'auto',
		    animation:   false,
		    container:  'body',
		    template:   '<div class="popover shadow border border-secondary" role="tooltip">' +
			        '<div class="arrow"></div><h3 class="popover-header"></h3>' +
                                '<div class="popover-body"></div>' +
			        '</div>',
		    content:    fun_content,
		    sanitizeFn: function (content) {
				    return content ; // DOMPurify.sanitize(content) ;
				}
	 }).on('shown.bs.popover',
		                function(shownEvent) {
                                    fun_ownshown(shownEvent);
                                    i18n_update_tags('dialogs') ;
                                    i18n_update_tags('gui') ;
                                    i18n_update_tags('cfg') ;
                                }) ;
    }

    //
    // Initialize UI
    //

    function wepsim_init_quickfixes ( )
    {
	// https://github.com/facebook/react-native/issues/18375
	/* eslint-disable no-extend-native */
	/* eslint-disable no-param-reassign */
	/* eslint-disable no-bitwise */
	if (!String.prototype.padStart)
        {
	  String.prototype.padStart = function padStart(targetLength, padString) {
	    targetLength >>= 0; // truncate if number, or convert non-number to 0;
	    padString = String(typeof padString !== 'undefined' ? padString : ' ');
	    if (this.length >= targetLength) {
	      return String(this);
	    }
	    targetLength -= this.length;
	    if (targetLength > padString.length) {
	      // append to original to ensure we are longer than needed
	      padString += padString.repeat(targetLength / padString.length);
	    }
	    return padString.slice(0, targetLength) + String(this);
	  };
	}
    }

    function wepsim_init_ui ( )
    {
            // fixed padString...
            wepsim_init_quickfixes() ;

	    // install protection for accidental close.
	    window.addEventListener("beforeunload", wepsim_confirm_exit) ;

	    // disable effects
	    if (typeof jQuery.fx != "undefined")
		jQuery.fx.off = true;
	    if (typeof ko != "undefined")
		ko.options.deferUpdates = true;

	    // carousel: touch swipe disabled
	    $('.carousel').carousel({ touch: false }) ;

	    // set wepsim version
	    $("div.wsversion").replaceWith(get_cfg('version'));

	    // tooltip: trigger by hover
	    $('[data-toggle="tooltip"]').tooltip({
		    trigger:   'hover',
		    sanitizeFn: function (content) {
				   return content ; // DOMPurify.sanitize(content) ;
				}
	    }) ;

	    // help popover...
	    $('a[data-toggle="popover1"]').popover({
		    placement: 'bottom',
		    animation: false,
		    trigger:   'focus, hover',
		    delay: { "show": 500, "hide": 100 },
		    sanitizeFn: function (content) {
				   return content ; // DOMPurify.sanitize(content) ;
				}
	    }) ;

	    // init: quick-menus
            for (var p in wsweb_quickcfg) 
            {
                 wepsim_init_quickcfg(wsweb_quickcfg[p].quick_id,
                                      wsweb_quickcfg[p].val_trigger,
		                      wsweb_quickcfg[p].fun_content,
		                      wsweb_quickcfg[p].fun_ownshown) ;
            }

	    // asmdbg
	    showhideAsmElements() ;

	    var target = $("#asm_table");
	    $("#asm_debugger_container").scroll(function() {
	       target.prop("scrollTop", this.scrollTop).prop("scrollLeft", this.scrollLeft);
	    });

	    // initialize editors
	    inputfirm_cfg = {
			        value: "\n\n\n\n\n\n\n\n\n\n\n\n",
			        lineNumbers: true,
			        lineWrapping: true,
			        matchBrackets: true,
			        tabSize: 2,
			        foldGutter: {
			  	   rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment)
			        },
			        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
			        mode: "text/javascript"
			    } ;
	    inputfirm = sim_init_editor("inputFirmware", inputfirm_cfg) ;

	    inputasm_cfg = {
				value: "\n\n\n\n\n\n\n\n\n\n\n\n",
				lineNumbers: true,
				lineWrapping: true,
				matchBrackets: true,
				tabSize: 2,
				extraKeys: {
				  "Ctrl-Space": function(cm) {
				      CodeMirror.showHint(cm, function(cm, options) {
					      var simware = get_simware();
					      var cur = cm.getCursor();
					      var result = [];
					      for (var i=0; i<simware.firmware.length; i++) {
						   if (simware.firmware[i].name != "begin") {
							result.push(simware.firmware[i].signatureUser) ;
						   }
					      }
					      return { list: result, from: cur, to: cur } ;
				      });
				  }
				},
				mode: "gas"
			    } ;
	    inputasm = sim_init_editor("inputAssembly", inputasm_cfg) ;

	    // init: voice
	    wepsim_voice_init() ;
	    if (false == get_cfg('use_voice')) {
		wepsim_voice_stop() ;
	    }
    }

    function wepsim_init_default ( )
    {
	    // Get URL params
            var url_hash = wepsim_preload_get2hash(window.location) ;

	    // 1.- Pre-load defaults

	       // 1.A.- Pre-load hardware...
	       simhw_hwset_init() ;
	       simcore_init_hw('ep') ;

	       // 1.B.- Pre-load examples
               var ws_examples_index_url = get_cfg('example_url') ;
               wepsim_example_loadSet(ws_examples_index_url) ;
               wepsim_example_load('Default') ;

	       // 1.C.- Pre-load UI configuration
               cfgset_init() ;

	    // 2.- Restore configuration

	       // 2.A.- Restore UI
               wepsim_uicfg_restore() ;

	       // 2.B.- Set mode
	       var ws_mode = get_cfg('ws_mode');
	       wsweb_select_main(ws_mode) ;
	       if (simhw_active() !== null) {
	      	   simcore_reset();
	       }

	       // 2.C.- Init recording
	       simcore_record_init('record_msg', 'record_pb') ;
               simcore_record_captureInit() ;

	    // Load/Configuration following URL params
            wepsim_preload_fromHash(url_hash) ;
    }

