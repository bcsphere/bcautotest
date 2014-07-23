/*
    Copyright 2013-2014, JUMA Technology

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

describe('Bluetooth',function(){
    var TEST_TIMEOUT = 10000;
    var uuids = ["0000ffe0-0000-1000-8000-00805f9b34fb"];
    var services = [];
    var characteristics = [];
    var descriptors = [];
    var serviceUUIDs = "FFF0";
    var device;
    var character;
    var characteristicValue;
    
    var onDeviceDisconnect = function(arg){
        alert("device:"+ arg.deviceAddress +" is disconnect!");
    }
        
    var onBluetoothStateChange = function(){
       if(BC.bluetooth.isopen){
          alert("bluetooth is opend!");
       }else{
          alert("bluetooth is closed!");
       }
    }
    
    var addNewDevice = jasmine.createSpy().andCallFake(function (s){
        var newDevice = s.target;
        expect(newDevice).toBeDefined();
        expect(newDevice).not.toBeNull();
        
        console.log("deviceAddress "+ newDevice.deviceAddress);
        var serviceUUIDs = newDevice.advertisementData['serviceUUIDs'];
		if(serviceUUIDs == "FFF0" || serviceUUIDs=="fff0" || newDevice.deviceAddress == "78:C5:E5:99:26:54"){
           device = newDevice;
        }
		
    });          
    
    beforeEach(function() {
		setTimeout(function(){
			BC.bluetooth.addEventListener('newdevice', addNewDevice);
		},100);
    });
    
    describe('Bluetooth Interface',function(){
	
		it('BC.Bluetooth',function(){
			BC.bluetooth.addEventListener('bluetoothstatechange', onBluetoothStateChange);
			expect(BC.bluetooth).toBeDefined();
		});
		
        it('startScan',function(){
           BC.Bluetooth.StartScan("LE");
        });
        
        it('getScanData',function(){
            waitsFor(function() { return addNewDevice.wasCalled; }, "addNewDevice never called", TEST_TIMEOUT);
            runs(function(){
                expect(addNewDevice).toHaveBeenCalled();
            });
        });
        
        it('stopScan',function(){
            BC.Bluetooth.StopScan();
        });
            
        it('scan by uuid',function(){
          // BC.Bluetooth.StartScan("LE",uuids);            
		   BC.Bluetooth.StartScan("LE"); 
           waitsFor(function() { return addNewDevice.wasCalled; }, "addNewDevice never called", TEST_TIMEOUT);
           runs(function(){
               expect(addNewDevice).toHaveBeenCalled();
               BC.Bluetooth.StopScan();
           });
        });
            
        it('addService',function(){
            var service = new BC.Service({"uuid":"ffe0"});
            var property = ["read","write","notify"];
            var permission = ["read","write"];
            var character1 = new BC.Characteristic({uuid:"ffe1",value:"01",type:"Hex",property:property,permission:permission});
            character1.addEventListener("onsubscribestatechange",function(s){alert("OBJECT EVENT!! onsubscribestatechange : (" + s.uuid + ") state:" + s.isSubscribed);});
            character1.addEventListener("oncharacteristicread",function(s){alert("OBJECT EVENT!! oncharacteristicread : (" + s.uuid + ")");});
            character1.addEventListener("oncharacteristicwrite",function(s){alert("OBJECT EVENT!! oncharacteristicwrite : (" + s.uuid + ") writeValue:" + s.writeValue.getHexString());});
            var character2 = new BC.Characteristic({uuid:"ffe2",value:"00",type:"Hex",property:property,permission:permission});
            var descriptor1 = new BC.Descriptor({uuid:"2901",value:"00",type:"Hex",permission:permission});
            descriptor1.addEventListener("ondescriptorread",function(s){alert("OBJECT EVENT!! ondescriptorread : " + s.uuid);});
            descriptor1.addEventListener("ondescriptorwrite",function(s){alert("OBJECT EVENT!! ondescriptorwrite : " + s.uuid);});
            var descriptor2 = new BC.Descriptor({uuid:"2902",value:"08",type:"Hex",permission:permission});
            character1.addDescriptor(descriptor1);
            character1.addDescriptor(descriptor2);
            service.addCharacteristic(character1);
            service.addCharacteristic(character2);
            
            var addServiceSuccess = jasmine.createSpy().andCallFake(function(){
                console.log("addServiceSuccess ");
            });
            
            var addServiceFailed = jasmine.createSpy().andCallFake(function(){
                console.log("addServiceFailed ");
            });
            
            BC.Bluetooth.AddService(service,addServiceSuccess,addServiceFailed);
            
            waitsFor(function() { return addServiceSuccess.wasCalled; }, "addServiceSuccess never called", TEST_TIMEOUT);
            
            runs(function(){
              expect(addServiceSuccess).toHaveBeenCalled();
            });    
        });
    });

  
    describe('Device Interface',function(){
        it('connect',function(){
            expect(device).not.toBeNull();
            var connectSuccess = jasmine.createSpy().andCallFake(function(){
                console.log("connectSuccess");
            });
            var connectFailed = jasmine.createSpy().andCallFake(function(){
                console.log("connectFailed");
            });
            
            device.addEventListener('devicedisconnected', onDeviceDisconnect);
            device.connect(connectSuccess,connectFailed);
            waitsFor(function() { return connectSuccess.wasCalled; }, "addServiceSuccess never called", TEST_TIMEOUT);
            
            runs(function(){
               expect(connectSuccess).toHaveBeenCalled();
            });
        }); 
        
        it('discoverServices',function(){
            var discoverServiceSuccess = jasmine.createSpy().andCallFake(function(){
                console.log("discoverServiceSuccess");
            });
            var discoverServiceFailed = jasmine.createSpy().andCallFake(function(){
                console.log("discoverServiceFailed");
            });
            device.discoverServices(discoverServiceSuccess,discoverServiceFailed);
            waitsFor(function() { return discoverServiceSuccess.wasCalled; }, "discoverServiceSuccess never called", TEST_TIMEOUT);
            
            runs(function(){
               expect(discoverServiceSuccess).toHaveBeenCalled();
            });
        });
        
        it('getDeviceInfo',function(){
           var getDeviceInfoSuccess = jasmine.createSpy().andCallFake(function(){
              console.log("System ID:"+device.systemID.getASCIIString()+"\n"+
              "Model Number:"+device.modelNum.getASCIIString()+"\n"+
              "Serial Number:"+device.serialNum.getASCIIString()+"\n"+
              "Firmware Revision:"+device.firmwareRevision.getASCIIString()+"\n"+
              "Hardware Revision:"+device.hardwareRevision.getASCIIString()+"\n"+
              "Software Revision:"+device.softwareRevision.getASCIIString()+"\n"+
              "Manufacturer Name:"+device.manufacturerName.getASCIIString()); 
            });
            var getDeviceInfoFailed = jasmine.createSpy().andCallFake(function(){
                console.log("getDeviceInfoFailed");
            });
            device.getDeviceInfo(getDeviceInfoSuccess,getDeviceInfoFailed);
            waitsFor(function() { return getDeviceInfoSuccess.wasCalled; }, "getDeviceInfoSuccess never called", TEST_TIMEOUT+5000);
            runs(function(){
               expect(getDeviceInfoSuccess).toHaveBeenCalled();
            });
        });
        
        it('getRSSI',function(){
            var getRSSISuccess = jasmine.createSpy().andCallFake(function(RSSI_value){
              console.log("the RSSI value is:"+RSSI_value); 
            });
            var getRSSIFailed = jasmine.createSpy().andCallFake(function(){
                console.log("getRSSIFailed");
            });
            device.getRSSI(getRSSISuccess,getRSSIFailed);
            waitsFor(function() { return getRSSISuccess.wasCalled; }, "getRSSISuccess never called", TEST_TIMEOUT);
            runs(function(){
               expect(getRSSISuccess).toHaveBeenCalled();
            });
        });
        
        it('getServiceByUUID',function(){
            services = device.getServiceByUUID("fff0");
            runs(function(){
               console.log("services.length "+ services.length);
               _.each(services,function(service){
                  console.log("services.uuid "+ service.uuid);
               });
               expect(services).not.toBeNull();
            });
            
            console.log("getServiceByUUID('0000fff0-0000-1000-8000-00805f9b34fb')");
            services = device.getServiceByUUID("0000fff0-0000-1000-8000-00805f9b34fb");
            runs(function(){
               console.log("services.length "+ services.length);
               _.each(services,function(service){
                  console.log("service.uuid "+ service.uuid);
               });
               expect(services).not.toBeNull();
            });
        });
    });

    describe('Service Interface',function(){
       
       it('discoverCharacteristics',function(){
            var discoverCharacteristicsSuccess = jasmine.createSpy().andCallFake(function(){
              console.log("discoverCharacteristicsSuccess"); 
            });
            var discoverCharacteristicsFailed = jasmine.createSpy().andCallFake(function(){
                console.log("discoverCharacteristicsFailed");
            });
            services[0].discoverCharacteristics(discoverCharacteristicsSuccess,discoverCharacteristicsFailed);
            waitsFor(function() { return discoverCharacteristicsSuccess.wasCalled; }, "discoverCharacteristicsSuccess never called", TEST_TIMEOUT);
            runs(function(){
               expect(discoverCharacteristicsSuccess).toHaveBeenCalled();
            });
       });
        
       it('getCharacteristicByUUID',function(){
            characteristics = services[0].getCharacteristicByUUID("fff1");
            runs(function(){
               console.log("characteristics.length "+ characteristics.length);
               _.each(characteristics,function(characteristic){
                  console.log("characteristic.uuid "+ characteristic.uuid);
               });
               expect(characteristics).not.toBeNull();
            });
       });
    });
    
    describe('Characteristic Interface',function(){
        it('discoverDescriptors',function(){
           var discoverDescriptorsSuccess = jasmine.createSpy().andCallFake(function(){
              console.log("discoverDescriptorsSuccess"); 
            });
            var discoverDescriptorsFailed = jasmine.createSpy().andCallFake(function(){
                console.log("discoverDescriptorsFailed");
            });
            services[0].characteristics[0].discoverDescriptors(discoverDescriptorsSuccess,discoverDescriptorsFailed);
            waitsFor(function() { return discoverDescriptorsSuccess.wasCalled; }, "discoverDescriptorsSuccess never called", TEST_TIMEOUT);
            runs(function(){
               expect(discoverDescriptorsSuccess).toHaveBeenCalled();
            });
        });
        
        it('getDescriptorByUUID',function(){
            descriptors = services[0].characteristics[0].getDescriptorByUUID("2901");
            runs(function(){
               console.log("descriptors.length "+ descriptors.length);
               _.each(descriptors,function(descriptor){
                  console.log("descriptor.uuid "+ descriptor.uuid);
               });
               expect(descriptors).not.toBeNull();
            });
        });
        
        it('read characteristic',function(){
            var readSuccess = jasmine.createSpy().andCallFake(function(data){
               characteristicValue = data.value.getHexString();
               console.log("Data : "+JSON.stringify(data.value)+" \n Time :"+data.date);
            });
            var readFailed = jasmine.createSpy().andCallFake(function(data){
               console.log("readFailed");
            });
            
            for(var i=0;i<services.length;i++){
                for(var j=0;j<services[i].characteristics.length;j++){
                    var characteristic = services[i].characteristics[j]; 
                    if(characteristic.property.contains('read')){
                        character=characteristic;
                        break;
                    }
                }
                if(character != undefined || character!=null){
                    break;
                }
            }
          
            character.read(readSuccess,readFailed);
            waitsFor(function() { return readSuccess.wasCalled; }, "readSuccess never called", TEST_TIMEOUT);
            runs(function(){
               expect(readSuccess).toHaveBeenCalled();
            });
        });
        
        it('write characteristic',function(){
            var writeSuccess = jasmine.createSpy().andCallFake(function(data){
               console.log(JSON.stringify(data));
            });
            var writeFailed = jasmine.createSpy().andCallFake(function(){
               console.log("writeFailed");
            });
            
            
            if(character == undefined || character == null || !character.property.contains('write')){
                for(var i=0;i<services.length;i++){
                    for(var j=0;j<services[i].characteristics.length;j++){
                        var characteristic = services[i].characteristics[j]; 
                        if(characteristic.property.contains('write')){
                            character=characteristic;
                            break;
                        }
                    }
                    if(character != undefined || character!=null){
                        break;
                    }
                }
            }
            var value = (characteristicValue=='01'?'0':'1');
            console.log("value :"+value);
            character.write("Hex",value,writeSuccess);
            waitsFor(function() { return writeSuccess.wasCalled; }, "writeSuccess never called", TEST_TIMEOUT);
            runs(function(){
               expect(writeSuccess).toHaveBeenCalled();
            });
        });
        
        
        it('subscribe',function(){
            var onNotify = jasmine.createSpy().andCallFake(function(data){
               console.log("notifyValue_hex " + data.value.getHexString() +"\n"
               +"notifyValue_unicode "+data.value.getUnicodeString() +"\n"
               +"notifyValue_ascii "+data.value.getASCIIString() +"\n"
               +"notifyDate "+ data.date);
            });
            
            
            if(character == undefined || character == null || !character.property.contains('notify')){
                for(var i=0;i<services.length;i++){
                    for(var j=0;j<services[i].characteristics.length;j++){
                        if(services[i].characteristics[j].property.contains('notify')){
                            character=services[i].characteristics[j];
                            break;
                        }
                    }
                    
                    if(character != undefined || character!=null){
                        break;
                    }
                }
            }
            
            character.subscribe(onNotify);
            waitsFor(function() { return onNotify.wasCalled; }, "onNotify never called", TEST_TIMEOUT);
            runs(function(){
               expect(onNotify).toHaveBeenCalled();
            });
        });
        
        it('unsubscribe',function(){
            var unsubscribeSuccess = jasmine.createSpy().andCallFake(function(){
               console.log("unsubscribeSuccess");
            });
            var unsubscribeFailed = jasmine.createSpy().andCallFake(function(data){
               console.log("readFailed");
            });
            character.unsubscribe(unsubscribeSuccess,unsubscribeFailed);
            waitsFor(function() { return unsubscribeSuccess.wasCalled; }, "unsubscribeSuccess never called", TEST_TIMEOUT);
            runs(function(){
               expect(unsubscribeSuccess).toHaveBeenCalled();
            });
        });
        
    });
    
    describe('Descriptor Interface',function(){
        
        it('read descriptor',function(){
            var readSuccess = jasmine.createSpy().andCallFake(function(data){
               console.log(JSON.stringify(data));
            });
            var readFailed = jasmine.createSpy().andCallFake(function(data){
               console.log("readFailed");
            });
            services[0].characteristics[0].descriptors[0].read(readSuccess,readFailed);
            waitsFor(function() { return readSuccess.wasCalled; }, "readSuccess never called", TEST_TIMEOUT);
            runs(function(){
               expect(readSuccess).toHaveBeenCalled();
            });
        });
    });
    
    describe('disconnect',function(){
           
        it('disconnect',function(){
            var disconnectSuccess = jasmine.createSpy().andCallFake(function(data){
               console.log("disconnectSuccess");
            });
            var disconnectFailed = jasmine.createSpy().andCallFake(function(){
               console.log("disconnectFailed");
            });
            device.disconnect(disconnectSuccess,disconnectFailed);
            waitsFor(function() { return disconnectSuccess.wasCalled; }, "readSuccess never called", TEST_TIMEOUT);
            runs(function(){
               expect(disconnectSuccess).toHaveBeenCalled();
            });
        });
    });
});