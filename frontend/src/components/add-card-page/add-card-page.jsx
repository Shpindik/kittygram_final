import React from "react";
import { useHistory } from "react-router-dom";

import { sendCard } from "../../utils/api";
import { colorsList, getBase64 } from "../../utils/constants";

import returnIcon from "../../images/left.svg";
import addImgIcon from "../../images/image.svg";

import { ButtonForm } from "../ui/button-form/button-form";
import { Select } from "../ui/select/select";
import { ButtonSecondary } from "../ui/button-secondary/button-secondary";
import { Input } from "../ui/input/input";
import { ColorsBox } from "../ui/colors-box/colors-box";

import styles from "./add-card-page.module.css";

export const AddCardPage = ({ extraClass = "" }) => {
  const [currentColor, setCurrentColor] = React.useState("#FFFFFF");
  const [currentFileName, setCurrentFileName] = React.useState("");
  const [card, setCard] = React.useState({
    color: currentColor,
    achievements: [],
  });
  const [errorName, setErrorName] = React.useState("");
  const [errorAge, setErrorAge] = React.useState("");

  const history = useHistory();

  const handleReturn = () => {
    history.goBack();
  };

  const onChangeInput = (e) => {
    setCard({
      ...card,
      [e.target.name]: e.target.value,
    });
    e.target.name === "image" && setCurrentFileName(e.target.value);
  };

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Масштабируем изображение
          const scale = Math.min(maxWidth / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob(
            (blob) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            },
            'image/jpeg',
            quality
          );
        };
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleSubmit = async () => {
    errorAge && setErrorAge("");
    errorName && setErrorName("");
  
    const photo = document.querySelector('input[type="file"]').files[0];
    
    if (photo) {
      try {
        const compressedBase64 = await compressImage(photo);
        card["image"] = compressedBase64;
        
        if (compressedBase64.length > 20 * 1024 * 1024) {
          alert("Изображение слишком большое после сжатия!");
          return;
        }
        
        const res = await sendCard(card);
        if (res?.id) history.push(`/cats/${res.id}`);
      } catch (err) {
        handleResponse(err);
      }
    } else {
      sendCard(card)
        .then((res) => {
          if (res?.id) history.push(`/cats/${res.id}`);
        })
        .catch(handleResponse);
    }
  };

  return (
    <div className={`${styles.content} ${extraClass}`}>
      <h2 className="text text_type_h2 text_color_primary mt-25 mb-9">
        Новый кот
      </h2>
      <ButtonSecondary
        extraClass={styles.return_btn_mobile}
        icon={returnIcon}
        onClick={handleReturn}
      />
      <div className={styles.container}>
        <label htmlFor="image" className={styles.img_box}>
          <img
            className={styles.img}
            src={addImgIcon}
            alt="Добавить фото котика."
          />
          <p className="text text_type_medium-16 text_color_primary">
            {currentFileName
              ? currentFileName
              : "Загрузите фото в фотрмате JPG"}
          </p>
        </label>
        <input
          type="file"
          className={styles.file_input}
          name="image"
          id="image"
          onChange={onChangeInput}
        />
        <Input
          onChange={onChangeInput}
          name="name"
          type="text"
          placeholder="Имя кота"
          error={errorName}
        />
        <Input
          onChange={onChangeInput}
          name="birth_year"
          type="text"
          placeholder="Год рождения"
          error={errorAge}
        />
        <ColorsBox
          colorsList={colorsList}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          card={card}
          setCard={setCard}
        />
        <Select card={card} setCard={setCard} />
        <ButtonForm
          extraClass={styles.submit_btn}
          text="Сохранить"
          onClick={handleSubmit}
        />
        <ButtonSecondary
          extraClass={styles.return_btn}
          icon={returnIcon}
          onClick={handleReturn}
        />
      </div>
    </div>
  );
};
