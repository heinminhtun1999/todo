import React from "react";
import closeIcon from "../Assets/icons/close.png"
import "../Assets/styles/FlashNoti.css";

const FlashNoti = (props) => {

    const { flashNoti, setFlashNoti } = props;

    return (
        <div className="flash-noti">
            <span className="flash-noti-text">
                {flashNoti}
            </span>
            <img src={closeIcon} alt="close-flash-noti" className='close-flash-noti' onClick={() => setFlashNoti(undefined)} />
        </div>
    )
}

export default FlashNoti;