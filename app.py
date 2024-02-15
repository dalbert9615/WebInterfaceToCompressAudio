from flask import Flask, render_template,request,send_from_directory
from pythonosc import udp_client
import os, wave
from config import UDP_HOST, UDP_PORT, SAVE_PATH, LOAD_PATH

app = Flask(__name__)

client = udp_client.SimpleUDPClient(UDP_HOST, UDP_PORT) 

# Home
@app.route('/')
def index():
    return render_template('index.html')

# save rec .wav -> local (raspi4)
@app.route('/save_recording', methods=['POST'])
def save_recording():
    recording = request.files['recording']
    save_path = SAVE_PATH  
    if recording:
        wav_file = wave.open(os.path.join(save_path, 'recording.wav'), 'wb')
        wav_file.setnchannels(1)  # 1 channel (mono)
        wav_file.setsampwidth(2)  # 2 bytes sample (16 bits)
        wav_file.setframerate(44100)  # Sampling rate 44100 Hz

        wav_file.writeframes(recording.read())

        wav_file.close()

        return '.wav guardado en ruta correctamente'
    else:
        return 'Error al guardar .wav en ruta'


@app.route('/static/audio/<path:filename>')
def descargar_audio(filename):
    directorio = os.path.join(app.root_path, 'static', 'audio')
    return send_from_directory(directory=directorio, filename=filename)

# time to rec -> progress bar
@app.route('/obtener_duracion')
def obtener_duracion():
    ruta = request.args.get('ruta')
    ruta_completa = os.path.join(app.root_path, ruta)
    with wave.open(ruta_completa, 'rb') as archivo_wav:
        duracion = archivo_wav.getnframes() / archivo_wav.getframerate()
    return str(duracion)

# Update controls -> PureData
audio_controls={'threshold':-1,'ratio':2,'response':40,'gain':1,'lookahead':1}
@app.route('/control_puredata')
def audio_controls():
    th = request.args.get('threshold',type=float)
    rati = request.args.get('ratio',type=float)
    rsp = request.args.get('response', type=float)
    gn = request.args.get('gain', type=float)
    looka = request.args.get('lookahead', type=float)
    
    audio_controls['threshold']=th
    audio_controls['ratio']=rati
    audio_controls['response']=rsp
    audio_controls['gain']=gn
    audio_controls['lookahead']=looka

    client.send_message('/threshold', th)
    client.send_message('/ratio', rati)
    client.send_message('/response', rsp)
    client.send_message('/gain', gn)
    client.send_message('/lookahead', looka)

    return 'Variables control de audio actualizadas'

# send selector RMS/PEAK -> PureData
@app.route('/rmspeak', methods=['POST'])
def rmspeak():
    radioGroup = request.form['mode']
    client.send_message("/rmspeak", int(radioGroup))
    return 'Variable selector rmspeak actualizada'

# send pulse to init compression -> PureData
@app.route('/compress', methods=['POST'])
def sendBangCompress():
    client.send_message('/start', 'bang')
    return 'Comienza compresion correctamente'

# send pulse to stop compression -> PureData
@app.route('/stop_compress', methods=['POST'])
def sendBangStopCompress():
    client.send_message('/stop', 'bang')
    return 'Acaba compresion correctamente'

# Download .wav compress
@app.route('/descargar_archivo')
def descargar_archivo():
    ruta_completa = os.path.join(app.root_path, LOAD_PATH)  
    return send_from_directory(directory=os.path.dirname(ruta_completa), filename=os.path.basename(ruta_completa), as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=443, ssl_context=('certificado.pem', 'clave_privada.pem'))