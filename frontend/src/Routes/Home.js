import React, { useState } from "react";
import "../Assets/styles/Home.css";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import AvatarEditor from 'react-avatar-editor'

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    let ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

const Home = () => {

    const [a, setA] = useState()
    const [editor, setEditor] = useState()
    const [b, setB] = useState();
    const [range, setRange] = useState(1.2)

    const handleChange = async (e) => {
        const file = e.target.files[0];
        setA(file)
    }

    const handleClick = async () => {
        if (editor) {
            const canvas = editor.getImageScaledToCanvas();
            const dataurl = canvas.toDataURL()
            setB(dataurl)
            const image = dataURItoBlob(dataurl)
            let fd = new FormData();
            fd.append('avatar', image);
            fd.append("first_name", "Hein");
            fd.append("last_name", "Htun");
            fd.append("username", "heinminhtun1dsad2bf31231")
            fd.append("email", "heinminhtun12dsasbfd3123@gmail.com")
            fd.append("password", "33954425Aa")
            // const b = fd.get("avatar");
            console.log(a.name)
            try {
                const res = await axios({
                    method: "post",
                    url: "/auth/register",
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    data: fd
                })
            } catch (e) {
                console.log(e.response)
            }
        }
    }

    const an = (e) => {
        setRange(e.target.value)
    }

    const setEditorRef = (editor) => setEditor(editor)

    return (
        <div className="home">
            Home Page
            <AvatarEditor
                image={a}
                ref={setEditorRef}
                width={250}
                height={250}
                border={50}
                color={[255, 255, 255, 0.6]} // RGBA
                scale={range}
                rotate={0}
                borderRadius={150}
            />
            <input type="file" accept="image/*" onChange={handleChange} />
            <input type="submit" value="submit" onClick={handleClick}></input>
            <input type="range" min={1.2} max={2} step="0.1" onChange={an} />
            <img src={b} style={{ borderRadius: "150%" }} />
            <Link to="/login" className="to-login">Login</Link>
        </div>
    )
}

export default Home;