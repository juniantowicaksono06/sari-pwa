<style scoped>
    #mainInput {
        position: fixed;
        bottom: 50px;
        z-index: 999;
        width: 100%;
        left: 0;
    }
</style>
<template>
    <div class="container h-100">
        <div class="d-flex justify-content-center align-items-end w-100 h-100">
            <audio id="audioPlayer"  src="" class="d-none" ref="audioPlayer"></audio>
            <video id="talkVideo" class="img-fluid" width="25%" autoplay ref="talkVideo"></video>
        </div>
        <div>
            <!-- <select name="" id=""></select> -->
            <div id="mainInput">
                <div class="d-flex justify-content-center align-items-center mb-2">
                    <input class="form-control w-50" v-model="textToSpeak" placeholder="Type text for me to speak...">
                </div>
                <div class="d-flex justify-content-center align-items-center mb-2">
                    <button class="btn btn-primary" @click="actionPlayAnim()">Submit</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    // import { mapActions } from 'vuex';
    import Phaser from 'phaser'
    import data from "../static/json/spritesheet.json"

    export default {
        data() {
            return {
                Game: null,
                textToSpeak: "",
                selectedSprite: [],
                spriteAnim: [],
                phaserObj: null,
                isAnimPlay: false
                // spriteSheetName: this.$store.state.SariSpritesheet.spritesheet_name,
            }
        },
        methods: {
            initSpritesheet() {
                const idle_sprite = data['idle']
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
                    document.querySelector('canvas').classList.add('avatar_canvas')
                    document.querySelector('canvas').classList.add('show')
                }
                const game = new Phaser.Game(config)
                this.Game = game
            },
            getSyllables() {
                if(this.textToSpeak == "") return false
                let inputText = this.textToSpeak
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
            async actionPlayAnim() {
                if(this.isAnimPlay || this.textToSpeak == "") return
                this.isAnimPlay = true
                const syllables = this.getSyllables()
                let nuxtObj = this

                let formData = new FormData()
                formData.append('text', this.textToSpeak)
                formData.append('language', "ID")
                // formData.append('audio_provider', 'microsoft')
                // formData.append('audio_voice_id', 'id-ID-GadisNeural')
                var audio_request = null;
                try {
                    let audio_request = await this.$axios.$post('vedita-tts', formData)
                    if(audio_request['status_code'] == 200) {
                        const { audio_b64 } = audio_request['data']
                        const objectURL = this.convertB64ToMp3(audio_b64)
                        this.loadAudio(objectURL)
                    }
                }
                catch(error) {
                    audio_request = false
                }
                if(audio_request == false) {
                    alert("Error")
                    return
                }
                syllables.forEach((list) => {
                    if(list.length > 0) {
                        list.forEach((value) => {
                            let v = value.toLowerCase()
                            if( v== "ma" || v == "pa") {
                                v = "ba"
                            }
                            if( v== "mi" || v == "pi") {
                                v = "bi"
                            }
                            if( v== "mu" || v == "pu") {
                                v = "bu"
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
                                frameRate: 51,
                            });
                            if(index == 0) {
                                nuxtObj.playAudio()
                                sprite.anims.play(value, true);
                            }
                        })
                        // Play the next spritesheet
                        function playNext() {
                            if(nuxtObj.selectedSprite.length <= 0 || nuxtObj.selectedSprite.length == 1) {
                                nuxtObj.Game.scene.remove('speak')
                                nuxtObj.spriteAnim.forEach((value) => {
                                    nuxtObj.Game.anims.remove(value)
                                })
                                nuxtObj.spriteAnim = []
                                sprite.destroy()
                                nuxtObj.isAnimPlay = false
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
        },
        mounted() {
            this.initSpritesheet()
        }
    }
</script>