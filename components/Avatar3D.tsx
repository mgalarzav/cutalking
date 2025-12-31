import React, { useRef, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';

interface Avatar3DProps {
    isSpeaking: boolean;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ isSpeaking }) => {
    const { settings } = useContext(AppContext);
    const videoRef = useRef<HTMLVideoElement>(null);

    const videoSrc = settings.avatar === 'linda' ? '/linda.mp4' : '/max.mp4';

    useEffect(() => {
        if (videoRef.current) {
            if (isSpeaking) {
                videoRef.current.play().catch(() => { });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isSpeaking]);

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-full border-4 border-white/20 shadow-2xl bg-black/10">
            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
            />
        </div>
    );
};
