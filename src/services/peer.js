class PeerService {

    createPeerConnection() {
        if(!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    { 
                        urls : [
                            'stun:stun.stun.services.mozilla.com'
                        ] 
                    }
                ]
            });    
        }
    }

    async createOffer() {
        if(this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(offer);
            return offer;
        }
    }

    async createAnswer() {
        if(this.peer) {
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            return answer;
        }
    }

    async setRemoteDescription(sdp) {
        await this.peer.setRemoteDescription(sdp);
        return true;
    }

}


export default PeerService;