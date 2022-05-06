import React from "react";
import "../Assets/styles/Avatar.css";

const Avatar = (props) => {

    const { src = "https://res.cloudinary.com/hein-s-cloud/image/upload/v1651469923/ToDO/Avatars/afzblll1thb9ghyrj71z.png", className, width = "50px", height = "50px" } = props;

    return (
        <div className={`avatar ${className}`} style={{ width, height }}>
            <img src={src} alt="profile-avatar" className="profile-avatar" />
        </div>
    )
}

export default Avatar;