import styles from "./imgfeat.module.css";
import Image from 'next/image';


const ImageFeat = () => {
    return (
        <main className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.text}>
                    <h2 className={styles.title}>Image Redaction</h2>
                    <p className={styles.titleText}>Detect and remove sensitive visual information. Click the button to use it!</p>
                    <a href="/image" className={styles.imageButton}>
                        Try PIReT for images
                    </a>
                </div>
                <div className={styles.image}>
                    <Image src={"/imgRedact.png"} width={343} height={281} alt="image lock" className={styles.imgImage}/>
                </div>
            </div>
        </main>
    );
};

export default ImageFeat;