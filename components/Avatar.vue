<style>
    #mainInput {
        position: absolute;
        bottom: 10px;
        left: 0;
        width: 25%;
    }
</style>
<template>
    <!-- <img src="img/idle-1.webp" alt=""> -->
    <div class="container h-100">
        <div class="d-flex justify-content-center align-items-end w-100 h-100">
            <audio id="audioPlayer"  src="" class="d-none" ref="audioPlayer"></audio>
            <video id="talkVideo" class="img-fluid" width="25%" autoplay ref="talkVideo"></video>
        </div>
        <div id="mainInput">
            <input type="text" class="form-control" placeholder="Type something..." v-model="textToSpeak">
            <button class="btn btn-primary mt-3" @click="playAnimation()">Submit</button>
        </div>
    </div>
</template>
<script>
    export default {
        destroyed() {
            // this.stopWebRTCSession()
        },
        data() {
            return {
                streamId: "",
                sessionId: "",
                peerConnection: null,
                videoIsPlaying: false,
                textToSpeak: "",
                lastBytesReceived: 0
            }
        },
        methods: {
            async stopWebRTCSession() {
                const streamId = this.streamId
                const sessionId = this.sessionId
                await this.$axios.$post(`https://api.d-id.com/talks/streams/${streamId}`, JSON.stringify({ session_id: sessionId }), {
                    headers: {
                        'Authorization': "Basic anVuaWFudG93aWNha3Nvbm8yMkBnbWFpbC5jb20:mAiC_E36w4O1T9tJkes4G",
                        'Content-Type': 'application/json',
                    }
                });
            },
            loadAndPlayAudio(objectURL) {
                let audio_player = this.$refs.audioPlayer
                audio_player.src=objectURL
                audio_player.play()
            },
            async playAnimation() {
                // if(this.textToSpeak == "") return
                // let formData = new FormData()
                // formData.append('text', this.textToSpeak)
                // formData.append('language', 'ID')
                // formData.append("audio_provider", 'microsoft')
                // formData.append("audio_voice_id", 'id-ID-GadisNeural')
                // let result = await this.$axios.$post('vedita-tts', formData, {
                //     headers: {
                //         'x-api-key': process.env.VEDITA_API_KEY
                //     }
                // })
                // if(result['status_code'] == 200) {
                //     const {audio_b64} = result['data']
                    
                //     const binaryAudioData = atob(audio_b64)
                //     const arrayBuffer = new ArrayBuffer(binaryAudioData.length)
                //     const view = new Uint8Array(arrayBuffer)
                //     for (let i = 0; i < binaryAudioData.length; i++) {
                //         view[i] = binaryAudioData.charCodeAt(i)   
                //     }

                //     const blob = new Blob([arrayBuffer], {type: 'audio/mp3'})
                //     const objectURL = URL.createObjectURL(blob)
                //     this.loadAndPlayAudio(objectURL)
                // }
            },
            // startStream() {
            //     // const streamId = this.streamId
            //     // const sessionId = this.sessionId
            //     // const textToSpeak = this.textToSpeak
            //     // const payload = JSON.stringify({
            //     //     "script": {
            //     //         "type": "text",
            //     //         "subtitles": "false",
            //     //         "provider": {
            //     //         "type": "microsoft",
            //     //         "voice_id": "id-ID-GadisNeural",
            //     //         "voice_name": "SARI",
            //     //         "voice_language": "ID"
            //     //         },
            //     //         "ssml": "false",
            //     //         "input": textToSpeak
            //     //     },
            //     //     "config": {
            //     //         "fluent": "false",
            //     //         "pad_audio": "0.0",
            //     //         "stitch": true
            //     //     },
            //     //     "session_id": sessionId,
            //     //     "name": "SARI_TES1"
            //     //     }
            //     // )
            //     // this.$axios.$post(`https://api.d-id.com/talks/streams/${streamId}`, payload, {
            //     //     headers: {
            //     //         'Content-Type': 'application/json',
            //     //         'Authorization': "Basic anVuaWFudG93aWNha3Nvbm8yMkBnbWFpbC5jb20:mAiC_E36w4O1T9tJkes4G"
            //     //     }
            //     // })
            // },
            // async onTrack(event) {
            //     setInterval(async () => {
            //         const stats = await this.peerConnection.getStats(event.track);
            //         stats.forEach((report) => {
            //             if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            //                 const videoStatusChanged = this.videoIsPlaying !== report.bytesReceived > this.lastBytesReceived;

            //                 if (videoStatusChanged) {
            //                 this.videoIsPlaying = report.bytesReceived > this.lastBytesReceived;
            //                     this.onVideoStatusChange(this.videoIsPlaying, event.streams[0]);
            //                 }
            //                 this.lastBytesReceived = report.bytesReceived;
            //             }
            //         });
            //     }, 500);
            // },
            // onVideoStatusChange(videoIsPlaying, stream) {
            //     let status;
            //     if (videoIsPlaying) {
            //         status = 'streaming';
            //         const remoteStream = stream;
            //         this.hideIdle()
            //         this.setVideoElement(remoteStream);
            //     } else {
            //         status = 'empty';
            //         // this.showIdle()
            //         // playIdleVideo();
            //     }
            // },
            // setVideoElement(stream) {
            //     if (!stream) return;
            //     this.$refs.talkVideo.srcObject = stream;
            //     this.$refs.talkVideo.loop = false;
            //     this.$refs.talkVideo.setAttribute('width', "388.5")
            //     this.$refs.talkVideo.setAttribute('height', "693.21")

            //     // safari hotfix
            //     if (this.$refs.talkVideo.paused) {
            //         this.$refs.talkVideo
            //         .play()
            //         .then((_) => {})
            //         .catch((e) => {});
            //     }
            // },
            // onIceCandidate(event) {
            // if (event.candidate) {
            //     const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
            //     this.$axios.$post(`https://api.d-id.com/talks/streams/${this.streamId}/ice`, JSON.stringify({
            //     candidate,
            //     sdpMid,
            //     sdpMLineIndex,
            //     session_id: this.sessionId
            //     }), {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': "Basic anVuaWFudG93aWNha3Nvbm8yMkBnbWFpbC5jb20:mAiC_E36w4O1T9tJkes4G"
            //     }
            //     })
            // }
            // },
            // async startWebRTCSession() {
            //     console.log("Starting WebRTC Session to D-ID")
            //     const sessionRequest = await this.$axios.$post(`https://api.d-id.com/talks/streams`, JSON.stringify({
            //         source_url: 'https://raw.githubusercontent.com/juniantowicaksono06/sari-store-img/main/sari_grapari.png'
            //     }), {
            //         headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': "Basic anVuaWFudG93aWNha3Nvbm8yMkBnbWFpbC5jb20:mAiC_E36w4O1T9tJkes4G"
            //         }
            //     })
            //     this.sessionId = sessionRequest['session_id']
            //     this.streamId = sessionRequest['id']
            //     const sessionClientAnswer = await this.createPeerConnection(sessionRequest['offer'], sessionRequest['ice_servers'])
            //     const sdpResponse = await this.$axios.$post(`https://api.d-id.com/talks/streams/${this.streamId}/sdp`, JSON.stringify({
            //         answer: sessionClientAnswer,
            //         session_id: this.sessionId,
            //         }), {
            //         headers: {
            //         Authorization: `Basic anVuaWFudG93aWNha3Nvbm8yMkBnbWFpbC5jb20:mAiC_E36w4O1T9tJkes4G`,
            //         'Content-Type': 'application/json',
            //         }
            //     });
            //     console.log(sdpResponse)
            //     },
            //     async createPeerConnection(offer, iceServers) {
            //     this.peerConnection = new RTCPeerConnection({ iceServers });
            //     // if (!peerConnection) {
            //         // Here we add event listeners for any events we want to handle
            //     // peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
            //     this.peerConnection.addEventListener('icecandidate', this.onIceCandidate, true);
            //     // peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
            //     // peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
            //     // peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
            //     this.peerConnection.addEventListener('track', this.onTrack, true);
            //     // // }

            //     await this.peerConnection.setRemoteDescription(offer);
            //     const sessionClientAnswer = await this.peerConnection.createAnswer();
            //     await this.peerConnection.setLocalDescription(sessionClientAnswer);

            //     return sessionClientAnswer;
            // },
            startIdle() {
                const {Scene, Game} = Phaser;
                const config = {
                    type: Phaser.AUTO,
                    width: 295 + 600,
                    // width: 600,
                    height: 337 + 900,
                    transparent: true,
                    scene: {
                        preload: preload,
                        create: create,
                    }
                };

                const game = new Game(config);

                function preload() {
                    this.load.spritesheet('idle', 'img/output_spritesheet.png', { frameWidth: 295, frameHeight: 337 });
                    // this.load.spritesheet('idle', 'img/output_spritesheet.png', { frameWidth: 296, frameHeight: 339 });
                }

                function create() {
                    const idle = this.add.sprite(295, 337, 'idle');
                    this.anims.create({
                        key: 'idle_1',
                        frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 121 }),
                        frameRate: 24,
                        repeat: -1 // Loop indefinitely
                    });

                    idle.anims.play('idle_1', true);
                    let audioPlayer = document.querySelector('#audioPlayer')
                    audioPlayer.src = "audio/tes_output.mp3"
                    audioPlayer.play()
                    document.querySelector('canvas').classList.add('avatar_canvas')
                    document.querySelector('canvas').classList.add('show')
                }
                this.showIdle()
            },
            hideIdle() {
                document.querySelector('canvas.avatar_canvas').classList.remove("show")
            },
            // hideIdle() {
            //     this.$refs.talkVideo.src = ""
            //     this.$refs.talkVideo.removeAttribute('loop')
                
            // },
            showIdle() {
                // document.querySelector('canvas.avatar_canvas').classList.add("show")
                // this.$refs.talkVideo.srcObject = undefined;
                // this.$refs.talkVideo.src = "video/idle.webm"
                // this.$refs.talkVideo.setAttribute('loop', true)
            }
        },
        mounted() {
            // this.$refs.talkVideo.setAttribute('playsinline', '');
            this.startIdle()
            // this.showIdle()
        }
    }
</script>