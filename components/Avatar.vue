<style scoped>
    #mainInput {
        position: fixed;
        bottom: 50px;
        z-index: 999;
        width: 100%;
        left: 0;
    }
    #recognizeInformation {
        position: fixed;
        bottom: 0;
        left: 0;
        padding-left: 10px;
    }

    #callDuration {
        margin-left: 100px;
        font-size: 24px;
    }

    #div-call-in-progress {
        margin-left: 40px;
    }

    #modal-call-in-progress-body {
        background-image: url('/img/user.png');
        background-size: cover;
    }

    #modal-incomming-call-body{
        background-image: url('/img/user.png');
        background-size: cover;
    }
</style>
<template>
    <div class="container h-100">
        <div id="recognizeInformation">
            <p class="text-success" v-if="isRecognizing == 1">Listening...</p>
            <p class="text-danger" v-if="isRecognizing == 0">Not Listening!</p>
        </div>
        <b-modal class="modal-item" centered v-model="IS_DIALUP_MODAL_OPEN" @hide="onDialUpModalClose" no-close-on-backdrop hide-footer size="sm" hide-header>
            <div class="modal-header">
                <div id="callDuration"></div>
            </div>
            <div class="modal-body" id="modal-call-in-progress-body" style="height: 300px;">
                <div class="mx-auto">
                    <h4 id="txtPhoneNumber" style="text-align: center;">{{ phoneNumber }}</h4>
                </div>
            </div>
            <div class="modal-footer mx-auto justify-content-center mt-2">
                <button type="button" class="btn btn btn-default btn-circle btnHangUp" @click="actionHangUp()">
                    <i class="fa fa-phone fa-2x fa-rotate-icon" aria-hidden="true" style="color: red;"></i>
                </button>
            </div>
        </b-modal>
        <b-modal class="modal-item" centered v-model="IS_CAMERA_MODAL_OPEN" @hide="onCameraModalClose" hide-footer size="md" hide-header>
            <h1>Camera</h1>
            <div class="w-100">
                <div class="w-100 h-100 d-flex align-items-center justify-content-center mt-4">
                    <h3 class="text-center" v-if="CAMERA_STREAM == null && CAPTURED_IMAGE == null">The Camera is starting...</h3>
                </div>
                <video id="cameraFeed" ref="cameraFeed" class="w-100" autoplay :class="{'d-none': CAPTURED_IMAGE != null || CAMERA_STREAM == null}"></video>
            </div>
            <div class="d-flex justify-content-center mb-3">
                <canvas id="canvasPhoto" class="w-100 d-none" ref="canvasPhoto"></canvas>
                <img :src="CAPTURED_IMAGE" alt="taken_photos" :class="{'d-none': CAPTURED_IMAGE == null}" class="img-fluid" >
            </div>
            <div class="d-block mb-3">
                <button class="btn btn-primary btn-block" @click="actionTakePicture()" v-if="CAPTURED_IMAGE == null">Take a picture</button>
                <button class="btn btn-success btn-block mb-3" @click="actionDownloadPicture()" v-if="CAPTURED_IMAGE != null">Download Picture</button>
                <button class="btn btn-primary btn-block" @click="actionRetakePicture()" v-if="CAPTURED_IMAGE != null">Take Picture again</button>
            </div>
            <div class="d-flex justify-content-end">
                <button class="btn btn-danger" @click="actionCloseCameraModal()">Close</button>
            </div>
        </b-modal>
        <div class="d-flex justify-content-center align-items-end w-100 h-100 d-none">
            <audio id="audioPlayer"  src="" class="d-none" ref="audioPlayer"></audio>
            <video id="talkVideo" class="img-fluid" width="25%" autoplay ref="talkVideo"></video>
        </div>
        <div>
            <div id="mainInput">
                <div class="w-100 h-100" v-if="DEBUG_MODE == 'true'">
                    <div class="d-flex justify-content-center align-items-center mb-2">
                        <input class="form-control w-50" v-model="textInput" placeholder="Type your text...">
                    </div>
                    <div class="d-flex justify-content-center align-items-center mb-2">
                        <button class="btn btn-success w-50" @click="actionRequestVedita()">Request</button>
                    </div>
                    <div class="d-flex justify-content-center align-items-center mb-2">
                        <button class="btn btn-primary w-50" @click="actionSpeak()">Speak</button>
                    </div>
                    <div class="d-flex justify-content-center align-items-center mb-2">
                        <button class="btn btn-warning w-50 text-white" @click="actionCall()">Telpon</button>
                    </div>
                </div>
                <div class="d-flex justify-content-center align-items-center">
                    <button class="btn btn-primary text-white rounded-circle px-4 py-4" @click="actionStartRecognize()" v-if="!isRecognizing">
                        <span>
                            <i class="fa fa-microphone fa-3x"></i>
                        </span>
                    </button>
                    <button class="btn btn-danger text-white rounded-circle px-4 py-4" @click="actionStopRecognize()" v-else>
                        <span>
                            <i class="fa fa-microphone fa-3x"></i>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    // import { mapActions } from 'vuex';
    import Phaser from 'phaser'
    import data from "../static/json/spritesheet.json"
    import constant from '../config/constant'

    export default {
        data() {
            return {
                Game: null,
                textInput: "",
                selectedSprite: [],
                spriteAnim: [],
                phaserObj: null,
                isAnimPlay: false,
                synth: null,
                speakSynthesis: null,
                speech_recognizer: null,
                isRecognizing: 0,
                IS_CAMERA_MODAL_OPEN: false,
                CAMERA_STREAM: null,
                CAPTURED_IMAGE: null,
                DEBUG_MODE: process.env.DEBUG_MODE,
                SYNTHESIS_TIMEOUT: null,
                status: constant.STATUS_IDLE,
                trigger_timeout: null,
                IS_DIALUP_MODAL_OPEN: false,
                TWILIO_DEVICE: null,
                callDuration: "00:00",
                phoneNumber: "",
            }
        },
        watch: {
            "isRecognizing": {
                handler: function(value) {
                    // if(value == 0) {
                    //     setTimeout(() => {
                    //         this.actionStartRecognize()
                    //     }, 200)
                    // }
                }
            }
        },
        methods: {
            log(message) {
                var logDiv = document.getElementById("log");
                logDiv.innerHTML += "<p>&gt;&nbsp;" + message + "</p>";
                logDiv.scrollTop = logDiv.scrollHeight;
            },
            showCallDuration() {
                var time;
                let output = document.getElementById('callDuration');
                let ms = 0;
                let sec = 0;
                let min = 0;

                function timer() {
                    ms++;
                    if (ms >= 100) {
                        sec++
                        ms = 0
                    }
                    if (sec === 60) {
                        min++
                        sec = 0
                    }
                    if (min === 60) {
                        ms,
                            sec,
                            min = 0;
                    }

                    let milli = ms < 10 ? `0` + ms : ms;
                    let seconds = sec < 10 ? `0` + sec : sec;
                    let minute = min < 10 ? `0` + min : min;

                    let timer = `${minute}:${seconds}`;
                    output.innerHTML = timer;
                };

                //Start timer
                function start() {
                    time = setInterval(timer, 10);
                }

                //stop timer
                function stop() {
                    clearInterval(time)
                }
                
                //reset timer
                function reset() {
                    ms = 0;
                    sec = 0;
                    min = 0;

                    output.innerHTML = `00:00:00`
                }

                // start the timer
                start()

                $("#modal-call-in-progress").on('hidden.bs.modal', function () {
                    stop()
                });

            },
            actionCall(phoneNumber = "") {
                phoneNumber = phoneNumber.trim()
                if(phoneNumber == "") {
                    return
                }
                else {
                    if(this.TWILIO_DEVICE == null || this.textInput == "" || this.textInput == null || this.textInput == undefined) return
                    if(phoneNumber == "" && this.textInput != "") {
                        phoneNumber = this.textInput
                    }
                    console.log("Nomor Telpon:", phoneNumber)
                }
                this.phoneNumber = phoneNumber.trim()
                if(!this.phoneNumber.startsWith('+')) {
                    if(this.phoneNumber.startsWith('62')) {
                        this.phoneNumber = `+${this.phoneNumber}`
                    }
                    else if(this.phoneNumber.startsWith("8")) {
                        this.phoneNumber = this.phoneNumber.substring(1)
                        this.phoneNumber = `+62${this.phoneNumber}`
                    }
                    else if( this.phoneNumber.startsWith('08')) {
                        this.phoneNumber = this.phoneNumber.slice(1, this.phoneNumber.split('').length)
                        this.phoneNumber = `+62${this.phoneNumber}`
                    }
                }
                else if(this.phoneNumber.startsWith("08")) {
                    this.phoneNumber = this.phoneNumber.slice(1, this.phoneNumber.split('').length)
                    this.phoneNumber = `+62${this.phoneNumber}`
                }
                if(!this.phoneNumber.startsWith('+62') && !this.phoneNumber.startsWith('08')) {
                    alert("Nomor HP tidak valid")
                    return
                }
                this.actionBusy()
                var outgoingConnection = this.TWILIO_DEVICE.connect({
                    To: this.phoneNumber
                })
                outgoingConnection.on("ringing", () => {
                    console.log("Phone ringing")
                })
                // this.actionOpenDialUpModal()
            },
            actionHangUp() {
                if(this.TWILIO_DEVICE != null) {
                    this.TWILIO_DEVICE.disconnectAll()
                }
                this.actionCloseDialUpModal()
                this.actionStopRecognize()
            },
            actionDownloadPicture() {
                const blob = this.dataURItoBlob(this.CAPTURED_IMAGE)
                const downloadLink = document.createElement('a')
                downloadLink.href = window.URL.createObjectURL(blob)
                downloadLink.download = 'captured_image.jpg'
                downloadLink.click()
            },
            dataURItoBlob(dataURI) {
                const byteString = atob(dataURI.split(',')[1]);
                const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ab], { type: mimeString });
            },
            actionRetakePicture() {
                this.stopCamera()
                this.CAPTURED_IMAGE = null
                this.startCamera()
            },
            actionTakePicture() {
                const desiredWidth = 1280; // Adjust to your desired width
                const desiredHeight = 720; // Adjust to your desired height
                this.$refs.canvasPhoto.width = desiredWidth
                this.$refs.canvasPhoto.height = desiredHeight
                this.$refs.canvasPhoto.getContext('2d').drawImage(this.$refs.cameraFeed, 0, 0, desiredWidth, desiredHeight)
                this.CAPTURED_IMAGE = this.$refs.canvasPhoto.toDataURL('image/jpeg')
                this.stopCamera()
            },
            onCameraModalClose() {
                this.IS_CAMERA_MODAL_OPEN = false
                this.CAPTURED_IMAGE = null
                this.stopCamera()
            },
            onDialUpModalClose(event) {
                // this.actionCloseDialUpModal()
            },
            actionOpenDialUpModal() {
                this.IS_DIALUP_MODAL_OPEN = true
            },
            actionCloseDialUpModal() {
                this.IS_DIALUP_MODAL_OPEN = false
            },
            actionCloseCameraModal() {
                this.IS_CAMERA_MODAL_OPEN = false
                this.CAPTURED_IMAGE = null
                this.stopCamera()
            },
            audioSynthesisTimer() {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
                this.SYNTHESIS_TIMEOUT = setTimeout(this.audioSynthesisTimer, 1000);
            },
            stopCamera() {
                if(this.CAMERA_STREAM != null) {
                    console.log("TESTING")
                    const tracks = this.CAMERA_STREAM.getTracks()
                    tracks.forEach((track) => {
                        track.stop()
                    })
                    this.$refs.cameraFeed.srcObject = null
                    this.CAMERA_STREAM = null
                }
            },
            async startCamera() {
                try {
                    this.CAMERA_STREAM = await navigator.mediaDevices.getUserMedia({video: true})
                    this.$refs.cameraFeed.srcObject = this.CAMERA_STREAM
                } catch (error) {
                    alert("Cannot start camera. Make sure you enabled camera permission")
                }
            },
            actionOpenCameraModal() {
                this.IS_CAMERA_MODAL_OPEN = true
                this.startCamera()
            },
            actionBusy() {
                this.speech_recognizer.stop()
                this.isRecognizing = 2
            },
            actionStartRecognize() {
                if(this.isRecognizing == 1 || this.speech_recognizer.isListening) return
                this.speech_recognizer.start()
                this.isRecognizing = 1
            },
            actionSpeak() {
                this.loadText(this.textInput)
                this.actionPlayAnim()
            },
            actionStopRecognize() {
                this.speech_recognizer.stop()
                this.isRecognizing = 0
            },
            loadText(text) {
                this.speakSynthesis.text = text
            },
            speak() {
                window.speechSynthesis.cancel();
                this.synth.speak(this.speakSynthesis)
            },
            initSpritesheet() {
                const idle_sprite = data['idle_v2']
                let nuxtObj = this
                const config = {
                    type: Phaser.AUTO,
                    width: 295 + 600,
                    height: 337 + 900,
                    transparent: true,
                    scene: {
                        preload: preload,
                        create: create,
                    }
                };
                function preload() {
                    this.load.spritesheet('main_sprite', `img/spritesheets/${idle_sprite['filename']}`, { frameWidth: idle_sprite['frameWidth'], frameHeight: idle_sprite['frameHeight'] });
                }
                function create() {
                    nuxtObj.phaserObj = this
                    const sprite = this.add.sprite(295, 337, 'main_sprite');
                    this.anims.create({
                        key: 'main_sprite_1',
                        frames: this.anims.generateFrameNumbers('main_sprite', { start: idle_sprite['frameStart'], end: idle_sprite['frameEnd'] }),
                        frameRate: 15,
                        repeat: -1 // Loop indefinitely
                    });
                    sprite.anims.play('main_sprite_1', true);
                    document.querySelector('canvas').classList.add('avatar-canvas')
                    if(sessionStorage.getItem("sariBody") === null || sessionStorage.getItem("sariBody") == 1) {
                        document.querySelector('canvas').classList.add('body-grapari')
                        sessionStorage.setItem('sariBody', 1)
                    }
                    else if(sessionStorage.getItem("sariBody") == 2) {
                        document.querySelector('canvas').classList.add('body-sport')
                        sessionStorage.setItem('sariBody', 2)
                    }
                    else if(sessionStorage.getItem("sariBody") == 3) {
                        document.querySelector('canvas').classList.add('body-batik')
                        sessionStorage.setItem('sariBody', 3)
                    }
                    else if(sessionStorage.getItem("sariBody") == 4) {
                        document.querySelector('canvas').classList.add('body-casual')
                        sessionStorage.setItem('sariBody', 4)
                    }
                    document.querySelector('canvas').classList.add('show')
                }
                const game = new Phaser.Game(config)
                this.Game = game
            },
            getSyllables() {
                if(this.speakSynthesis.text == "") return false
                let inputText = this.speakSynthesis.text
                let words = inputText.split(' ')
                const vowels = ['A', 'I', 'U', 'E', 'O']
                const syllables = []
                words.forEach(word => {
                    const w = [];
                    let pos = 0;
                    try {
                        for (let i = 0; i < word.length; i++) {
                        if (i < pos) continue;

                        if (vowels.includes(word[pos].toUpperCase())) {
                            w.push(word[pos]);
                            pos = pos + 1;
                        } else if ((word[pos] + word[pos + 1] === "ng" ||
                            word[pos] + word[pos + 1] === "ny")) {
                            if (vowels.includes(word[pos + 2].toUpperCase())) {
                            w.push(word[pos + 2]);
                            pos = pos + 3;
                            } else if (!vowels.includes(word[pos + 2].toUpperCase()) &&
                                vowels.includes(word[pos + 3].toUpperCase())) {
                            w.push(word[pos + 2] + word[pos + 3]);
                            pos = pos + 4;
                            }
                        } else if (!vowels.includes(word[pos].toUpperCase())) {
                            if (vowels.includes(word[pos + 1].toUpperCase())) {
                            w.push(word[pos] + word[pos + 1]);
                            pos = pos + 2;
                            } else if (!vowels.includes(word[pos + 1].toUpperCase()) &&
                                vowels.includes(word[pos + 2].toUpperCase())) {
                            if (word[pos + 1].toLowerCase() === "h" ||
                                word[pos + 1].toLowerCase() === "r") {
                                w.push(word[pos] + word[pos + 2]);
                                pos = pos + 3;
                            } else {
                                w.push(word[pos + 1] + word[pos + 2]);
                                pos = pos + 3;
                            }
                            }
                        }
                        }
                    } catch (e) {
                    }
                    syllables.push(w);
                });

                const finalSyl = [];
                syllables.forEach(syl => {
                    if (syl.length > 2) {
                        for (let i = 0; i < syl.length; i += 2) {
                        if (i + 1 < syl.length) {
                            finalSyl.push([syl[i], syl[i + 1]]);
                        } else {
                            finalSyl.push([syl[i]]);
                        }
                        }
                    } else {
                        finalSyl.push(syl);
                    }
                });
                return syllables
            },
            convertB64ToMp3(audio_b64) {
                const binaryAudioData = atob(audio_b64)
                const arrayBuffer = new ArrayBuffer(binaryAudioData.length)
                const view = new Uint8Array(arrayBuffer)
                for (let i = 0; i < binaryAudioData.length; i++) {
                    view[i] = binaryAudioData.charCodeAt(i)   
                }

                const blob = new Blob([arrayBuffer], {type: 'audio/mp3'})
                const objectURL = URL.createObjectURL(blob)
                return objectURL
            },
            async actionPlayAnim(fn = null) {
                if(this.isAnimPlay || this.speakSynthesis.text == "") return
                this.isAnimPlay = true
                const syllables = this.getSyllables()
                let nuxtObj = this

                // let formData = new FormData()
                // formData.append('text', this.textInput)
                // formData.append('language', "ID")
                // formData.append('audio_provider', 'microsoft')
                // formData.append('audio_voice_id', 'id-ID-GadisNeural')
                // var audio_request = null;
                // try {
                //     let audio_request = await this.$axios.$post('vedita-tts', formData)
                //     if(audio_request['status_code'] == 200) {
                //         const { audio_b64 } = audio_request['data']
                //         const objectURL = this.convertB64ToMp3(audio_b64)
                //         this.loadAudio(objectURL)
                //     }
                // }
                // catch(error) {
                //     audio_request = false
                // }
                // if(audio_request == false) {
                //     alert("Error")
                //     return
                // }
                syllables.forEach((list) => {
                    if(list.length > 0) {
                        list.forEach((value) => {
                            let v = value.toLowerCase()
                            if(v == "va") {
                                v = "fa"
                            }
                            if(v == "vi") {
                                v = "fi"
                            }
                            if(v == "ve") {
                                v = "fe"
                            }
                            if(v == "vo") {
                                v = "fo"
                            }
                            if( v== "ma" || v == "pa") {
                                v = "ba"
                            }
                            if( v== "mi" || v == "pi") {
                                v = "bi"
                            }
                            if( v== "ngi") {
                                v = "i"
                            }
                            if( v== "mu" || v == "pu") {
                                v = "bu"
                            }
                            if( v== "me" || v == "pe") {
                                v = "be"
                            }
                            if( v== "mo" || v == "po") {
                                v = "bo"
                            }
                            if(
                                v == "da" || 
                                v == "ga" || 
                                v == "ha" || 
                                v == "ja" || 
                                v == "ka" || 
                                v == "na" || 
                                v == "qa" || 
                                v == "sa" || 
                                v == "xa" || 
                                v == "ya" || 
                                v == "za"
                            ) {
                                v = "ca"
                            }
                            if(
                                v == "di" ||
                                v == "gi" ||
                                v == "hi" ||
                                v == "ji" ||
                                v == "ki" ||
                                v == "ni" ||
                                v == "qi" ||
                                v == "si" ||
                                v == "xi" ||
                                v == "yi" ||
                                v == "zi" 
                            ) {
                                v = "ci"
                            }
                            if(
                                v == "du" ||
                                v == "gu" ||
                                v == "hu" ||
                                v == "ju" ||
                                v == "ku" ||
                                v == "nu" ||
                                v == "qu" ||
                                v == "su" ||
                                v == "xu" ||
                                v == "yu" ||
                                v == "zu" ||
                                v == "ru" ||
                                v == "tu" ||
                                v == "fu" ||
                                v == "vu" ||
                                v == "lu" ||
                                v == "wu"
                            ) {
                                v = "cu"
                            }
                            if(
                                v == "de" ||
                                v == "ge" ||
                                v == "he" ||
                                v == "je" ||
                                v == "ke" ||
                                v == "ne" ||
                                v == "qe" ||
                                v == "se" ||
                                v == "xe" ||
                                v == "ye" ||
                                v == "ze"
                            ) {
                                v = "ce"
                            }
                            if(
                                v == "do" ||
                                v == "go" ||
                                v == "ho" ||
                                v == "jo" ||
                                v == "ko" ||
                                v == "no" ||
                                v == "qo" ||
                                v == "so" ||
                                v == "xo" ||
                                v == "yo" ||
                                v == "zo" ||
                                v == "ro" ||
                                v == "to"
                            ) {
                                v = "co"
                            }
                            if(v == "te") {
                                v = "re"
                            }
                            if(v == "ta") {
                                v = "ra"
                            }
                            if(v == "ti" || v == "ty") {
                                v = "ri"
                            }
                            if(v == "py") {
                                v = "by"
                            }
                            if(v == "shy" || v == "xy") {
                                v = "cy"
                            }
                            if(v == "vy" || v == "fly") {
                                v = "fy"
                            }
                            if(v == "ky") {
                                v = "gy"
                            }
                            nuxtObj.selectedSprite.push(v)
                            nuxtObj.spriteAnim.push(v)
                        })
                    }
                })
                
                class LoadSprite extends Phaser.Scene
                {
                    constructor ()
                    {
                        super({ key: "speak" });
                    }
                    preload() {
                        nuxtObj.selectedSprite.forEach((value) => {
                            console.log(value)
                            this.load.spritesheet(value, `img/spritesheets/${data[value]['filename']}`, { frameWidth: data[value]['frameWidth'], frameHeight: data[value]['frameHeight'] });
                        })  
                    }
                    create() {
                        let sprite = null
                        let spriteObj = this
                        nuxtObj.selectedSprite.forEach((value, index) => {
                            if(index == 0) {
                                sprite = this.add.sprite(295, 337, value);
                            }
                            this.anims.create({
                                key: value,
                                frames: this.anims.generateFrameNumbers(value, { start: data[value]['frameStart'], end: data[value]['frameEnd'] }),
                                frameRate: 37,
                            });
                            if(index == 0) {
                                nuxtObj.speak()
                                sprite.anims.play(value, true);
                                // nuxtObj.playAudio()
                            }
                        })
                        // Play the next spritesheet
                        function playNext() {
                            if(nuxtObj.selectedSprite.length <= 0 || nuxtObj.selectedSprite.length == 1) {
                                if(fn != null) {
                                    if(typeof fn == "function") {
                                        fn()
                                    }
                                }
                                nuxtObj.Game.scene.remove('speak')
                                nuxtObj.spriteAnim.forEach((value) => {
                                    nuxtObj.Game.anims.remove(value)
                                })
                                nuxtObj.spriteAnim = []
                                sprite.destroy()
                                nuxtObj.isAnimPlay = false
                                nuxtObj.actionStopRecognize()
                                return
                            }
                            sprite = spriteObj.add.sprite(295, 337, nuxtObj.selectedSprite[0])
                            sprite.anims.play(nuxtObj.selectedSprite[0], true)
                            sprite.setTexture(nuxtObj.selectedSprite[0])
                            sprite.on('animationcomplete', function() {
                                if(nuxtObj.selectedSprite.length <= 0) return
                                nuxtObj.selectedSprite.shift()
                                playNext()
                            }) 
                        }

                        sprite.on('animationcomplete', function() {
                            playNext()
                            nuxtObj.selectedSprite.shift()
                        })
                    }
                }
                this.Game.scene.add('speak', LoadSprite)
                this.Game.scene.start('speak')
            },
            destroySprite() {
                this.sprite.destroy()
            },
            loadAudio(objectURL) {
                this.$refs.audioPlayer.pause()
                this.$refs.audioPlayer.src = objectURL
            },
            playAudio() {
                this.$refs.audioPlayer.play()
            },
            loadAndPlayAudio(objectURL) {
                let audio_player = this.$refs.audioPlayer
                audio_player.src=objectURL
                audio_player.play()
            },
            hideIdle() {
                document.querySelector('canvas.avatar_canvas').classList.remove("show")
            },
            async actionRequestVedita() {
                this.actionBusy()
                this.$store.dispatch('loading/actionShowLoading')
                var result = null;
                let data = []
                if(this.textInput.toLowerCase().startsWith('ganti skin')) {
                    this.$store.dispatch('loading/actionHideLoading')
                    let sariBody = document.querySelector('canvas.avatar-canvas')
                    this.actionStopRecognize()
                    if(sariBody === null) return
                    if(this.textInput.toLowerCase().startsWith('ganti skin 1')) {
                        sariBody.classList.remove('body-grapari')
                        sariBody.classList.remove('body-sport')
                        sariBody.classList.remove('body-batik')
                        sariBody.classList.remove('body-casual')
                        sariBody.classList.add('body-grapari')
                        sessionStorage.setItem("sariBody", 1)
                    }
                    else if(this.textInput.toLowerCase().startsWith('ganti skin 2')) {
                        sariBody.classList.remove('body-grapari')
                        sariBody.classList.remove('body-sport')
                        sariBody.classList.remove('body-batik')
                        sariBody.classList.remove('body-casual')
                        sariBody.classList.add('body-sport')
                        sessionStorage.setItem("sariBody", 2)
                    }
                    else if(this.textInput.toLowerCase().startsWith('ganti skin 3')) {
                        sariBody.classList.remove('body-grapari')
                        sariBody.classList.remove('body-sport')
                        sariBody.classList.remove('body-batik')
                        sariBody.classList.remove('body-casual')
                        sariBody.classList.add('body-batik')
                        sessionStorage.setItem("sariBody", 3)
                    }
                    else if(this.textInput.toLowerCase().startsWith('ganti skin 4')) {
                        sariBody.classList.remove('body-grapari')
                        sariBody.classList.remove('body-sport')
                        sariBody.classList.remove('body-batik')
                        sariBody.classList.remove('body-casual')
                        sariBody.classList.add('body-casual')
                        sessionStorage.setItem("sariBody", 4)
                    }
                    return
                }
                try {
                    result = await this.$axios.$get(`vedita-datacenter?text=${this.textInput.toLowerCase()}`, {
                        validateStatus: function(status) {
                            return status < 500 && status != 404
                        }
                    })
                    // tag = result['data']['tag']
                    // response_text = result['data']['response_text']
                    data = result['data']
                    
                } catch (error) {
                    result = error.response['data']['data']
                    if(result.status_code != 404) {
                        result = false
                        alert("Error occured")
                    }
                    else {
                        data = result
                    }
                }
                this.$store.dispatch('loading/actionHideLoading')
                if (result == false && data.length == 0) return
                this.handleVoiceCommands(data)
            },
            handleVoiceCommands(data) {
                const {tag} = data
                let response_text = data['response_text']
                console.log(response_text)
                var contact = {}
                
                if(tag == "telpon") {
                    contact = data['contact']
                    // response_text = "Maaf, untuk sementara ini SARI PWA tidak dapat melakukan panggilan telepon"
                    response_text = `Baik kak saya akan telpon ${contact['name']}`
                }

                if(response_text != "" && response_text != null && response_text != undefined && tag != "unknown") {
                    this.loadText(response_text)
                    var fn = null
                    if(tag == "telpon") {
                        fn = () => {
                            this.actionCall(contact['phone'])
                        }
                    }
                    this.actionPlayAnim(fn)
                }

                if(tag == "unknown") {
                    this.$store.dispatch('loading/actionShowLoading')
                    
                    const payload = JSON.stringify({
                        'model': "gpt-3.5-turbo",
                        'messages': [
                            {
                                "role": "system", 
                                "content": "You are a helpful assistant, you give answer as short as possible"
                            },
                            {
                                "role": "user",
                                "content": this.textInput
                            }
                        ]
                    })
                    const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENAI_TOKEN}`
                    }
                    fetch("https://api.openai.com/v1/chat/completions", {
                        method: 'POST',
                        headers: headers,
                        body: payload
                    }).then((response) => {
                        if(!response.ok) {
                            throw new Error("Network response was not ok")
                        }
                        return response.json()
                    })
                    .then((result) => {
                        const {choices} = result
                        const message = choices[0]['message']['content']
                        this.loadText(message)
                        this.speak()
                        this.actionPlayAnim()
                        this.$store.dispatch('loading/actionHideLoading')
                    })
                    .catch((error) => {
                        alert("Error occured while connecting to OpenAI API")
                        this.$store.dispatch('loading/actionHideLoading')
                    })
                }

                if(tag == "capture_foto") {
                    this.actionOpenCameraModal()
                }
            },
            resumeInfinity() {
                window.speechSynthesis.resume();
                this.SYNTHESIS_TIMEOUT = setTimeout(this.resumeInfinity, 1000);
            },
            getTwilioToken() {
                fetch(`${process.env.TWILIO_WEBHOOK}/token`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json'
                    }
                })
                .then((response) => response.json())
                .then((result) => {
                    let new_data = result['data']
                    this.TWILIO_DEVICE = new Twilio.Device(new_data.token, {
                        // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
                        // providing better audio quality in restrained network conditions. Opus will be default in 2.0.
                        codecPreferences: ["opus", "pcmu"],
                        // Use fake DTMF tones client-side. Real tones are still sent to the other end of the call,
                        // but the client-side DTMF tones are fake. This prevents the local mic capturing the DTMF tone
                        // a second time and sending the tone twice. This will be default in 2.0.
                        fakeLocalDTMF: true,
                        // Use `enableRingingState` to enable the device to emit the `ringing`
                        // state. The TwiML backend also needs to have the attribute
                        // `answerOnBridge` also set to true in the `Dial` verb. This option
                        // changes the behavior of the SDK to consider a call `ringing` starting
                        // from the connection to the TwiML backend to when the recipient of
                        // the `Dial` verb answers.
                        enableRingingState: true,
                        debug: true,
                    });

                    this.TWILIO_DEVICE.on("ready", (device) => {
                        
                        console.log("Twilio is Ready")
                    });

                    this.TWILIO_DEVICE.on("error", (error) => {
                        alert("Error when try to make a call!")
                    });

                    this.TWILIO_DEVICE.on("connect", (conn) => {
                        // $('#modal-call-in-progress').modal('show')
                        this.actionOpenDialUpModal()
                        setTimeout(() => {
                            this.showCallDuration()
                        }, 200)
                    });

                    this.TWILIO_DEVICE.on("disconnect", (conn) => {
                        // $('.modal').modal('hide')
                        this.actionCloseDialUpModal()
                        this.TWILIO_DEVICE.disconnectAll()
                    });

                    this.TWILIO_DEVICE.on("incoming", (conn) => {

                    })
                })
            }
        },
        mounted() {
            this.getTwilioToken()

            this.initSpritesheet()
            this.synth = window.speechSynthesis
            
            window.speechSynthesis.cancel();
            this.speakSynthesis = new SpeechSynthesisUtterance()
            this.speakSynthesis.onstart = () => {
                this.audioSynthesisTimer()
            }
            this.speakSynthesis.onend = () => {
                clearTimeout(this.SYNTHESIS_TIMEOUT)
                setTimeout(() => {
                    this.actionStopRecognize()
                }, 200)
            }
            // this.SYNTHESIS_TIMEOUT = setTimeout(this.audioSynthesisTimer, 1000)
            this.speakSynthesis.lang = 'id-ID'
            this.speakSynthesis.rate = 0.8
            this.speakSynthesis.addEventListener('boundary', (event) => {
                console.log(event.charIndex)
            })
            // this.synth.pitch = 1.1
            this.speakSynthesis.voice = this.synth.getVoices()[11]
            // this.speakSynthesis.onend = () => {
            //     console.log("TESTING")
            //     clearTimeout(this.SYNTHESIS_TIMEOUT)
            // }
            // Check if the browser supports the Web Speech API
            if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
                    // Create a new SpeechRecognition object
                // const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                this.speech_recognizer = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

                // Define event handlers for the recognition process
                this.speech_recognizer.onstart = () => {
                    console.log('Speech recognition started');
                };

                this.speech_recognizer.onresult = async (event) => {
                    // if(this.trigger_timeout != null) {
                    //     clearTimeout(this.trigger_timeout)
                    //     this.trigger_timeout = null
                    // }
                    
                    // this.trigger_timeout = setTimeout(() => {
                    //     console.log("Returning back to idle due to no response")
                    //     this.status = constant.STATUS_IDLE
                    //     this.actionStopRecognize()
                    //     clearTimeout(this.trigger_timeout)
                    //     this.trigger_timeout = null
                    // }, 20000)
                    const transcript = event.results[0][0].transcript;
                    this.textInput = transcript
                    // await this.requestVedita()
                    console.log(this.textInput)
                    if(this.textInput != "") {
                        this.actionBusy()
                    }
                    console.log(this.textInput.toLowerCase().trim() == 'halo sari' && this.status == constant.STATUS_IDLE)
                    if(this.textInput.toLowerCase().trim() == 'halo sari' && this.status == constant.STATUS_IDLE) {
                        this.status = constant.STATUS_TRIGGER
                        this.loadText("Halo juga kak, ada yang bisa saya bantu?")
                        this.actionPlayAnim()
                        // this.speak()
                    }
                    else if(this.status == constant.STATUS_TRIGGER || this.textInput.toLowerCase().trim().startsWith("ganti skin")) {
                        this.actionRequestVedita()
                    }
                    else {
                        setTimeout(() => {
                            this.actionStopRecognize()
                        }, 200)
                    }
                };

                this.speech_recognizer.onend = () => {
                    console.log('Speech recognition ended');
                    if(this.isRecognizing == 2) return
                    this.actionStopRecognize()
                };
                this.speech_recognizer.lang = 'id-ID'
            } else {
                console.error('Speech recognition not supported in this browser.');
                alert('Speech recognition not supported in this browser.');
            }
            this.$OneSignal.push(() => {
                this.$OneSignal.on('notificationDisplay', (event) => {
                    console.log('OneSignal notification displayed:', event);
                });
            });
        }
    }
</script>