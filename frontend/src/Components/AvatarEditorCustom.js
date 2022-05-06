import React, { useState } from "react";
import AvatarEditor from "react-avatar-editor";
import "../Assets/styles/AvatarEditorCustom.css";
import { dataURItoBlob } from "../utils";
import Button from "./Button";

const AvatarEditorCustom = (props) => {

    const { file, setFile, setData, setDisplayAvatar } = props;

    const [editor, setEditor] = useState()
    const [imageSettings, setImageSettings] = useState({
        scale: 1,
        rotate: 0
    });

    const handleAvatarScaleChange = (e) => {
        setImageSettings(prevValue => {
            return {
                ...prevValue,
                scale: parseFloat(e.target.value)
            }
        })
    }

    const handleAvatarRotateChange = (e) => {
        setImageSettings(prevValue => {
            return {
                ...prevValue,
                rotate: parseFloat(e.target.value)
            }
        })
    }

    const saveEditedImage = () => {
        if (editor) {
            const canvas = editor.getImageScaledToCanvas();
            const imgUrl = canvas.toDataURL();
            const imgFile = dataURItoBlob(imgUrl);
            setData(prevValue => {
                return {
                    ...prevValue,
                    avatar: imgFile
                }
            });
            setDisplayAvatar(imgUrl);
            setFile();
        }
    }

    const setEditorRef = editor => setEditor(editor)

    return (
        <div className="edit-avatar" >
            <div className="edit-avatar-overlay" onClick={() => setFile()}></div>
            <div className="edit-avatar-container">
                <h2 className="edit-avatar-title">Editor Avatar</h2>
                <AvatarEditor
                    ref={setEditorRef}
                    border={50}
                    width={200}
                    height={200}
                    color={[0, 0, 0, 0.6]}
                    className="a"
                    borderRadius={150}
                    image={file}
                    scale={imageSettings.scale}
                    rotate={imageSettings.rotate}
                    style={{ width: "100%" }}
                />
                <div className="scale-range-container">
                    <label htmlFor="scale-range">Scale</label>
                    <input type="range" onChange={handleAvatarScaleChange} id="size-range" min={1} max={3} step={0.1} defaultValue={1} className="avatar-editor-range" />
                </div>
                <div className="rotate-range-container">
                    <label htmlFor="rotate-range">Rotate</label>
                    <input type="range" onChange={handleAvatarRotateChange} id="rotate-range" min={0} max={180} step={1} defaultValue={1} className="avatar-editor-range" />
                </div>
                <div className="avatar-editor-interaction-btn">
                    <span className="cancel-edit-avatar" onClick={() => setFile()}>Cancel</span>
                    <Button text="Save" onClick={saveEditedImage} className="save-edited-avatar" />
                </div>
            </div>
        </div>
    )
}

export default AvatarEditorCustom;