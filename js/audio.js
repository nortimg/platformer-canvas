const sounds = ['02690.mp3', '04174.mp3', '11099.mp3']



export const playRandomAudio = () => {
    const randomAudio = () => sounds[Math.floor(Math.random() * sounds.length)]

    const audio = document.getElementById('audio')
    
    audio.src = './sounds/' + randomAudio()
    
    audio.play()
} 