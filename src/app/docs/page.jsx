'use client'
import React, { useState } from 'react';
import { Check, Copy, Upload, FileText, Image } from 'lucide-react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import styles from '../docs/docs.module.css';

const DocumentRedaction = () => {
  const [file, setFile] = useState(null);
  const [redactedContent, setRedactedContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(['ACCOUNT_NUMBER', 'AGE', 'DATE', 'DATE_INTERVAL', 'DOB', 'DRIVER_LICENSE', 'DURATION', 'EMAIL_ADDRESS', 'FILENAME', 'IP_ADDRESS', 'LOCATION', 'LOCATION_ADDRESS', 'LOCATION_ADDRESS_STREET', 'LOCATION_CITY', 'LOCATION_COORDINATE', 'LOCATION_COUNTRY', 'LOCATION_STATE', 'LOCATION_ZIP', 'MONEY', 'NAME', 'NAME_FAMILY', 'NAME_GIVEN', 'NAME_MEDICAL_PROFESSIONAL', 'NUMERICAL_PII', 'ORGANIZATION', 'OCCUPATION', 'ORIGIN', 'PASSPORT_NUMBER', 'PASSWORD', 'PHONE_NUMBER', 'SSN', 'URL', 'USERNAME', 'VEHICLE_ID', 'BANK_ACCOUNT', 'CREDIT_CARD', 'CREDIT_CARD_EXPIRATION', 'CVV']);
  const [encryptedFile, setEncryptedFile] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fileType, setFileType] = useState('');
  const [base64str, setbase64Str] = useState('');
  const [base64strImage, setbase64StrImage] = useState('');


  const filters = {
    "PII (Personally Identifiable Information)": ['ACCOUNT_NUMBER', 'AGE', 'DATE', 'DATE_INTERVAL', 'DOB', 'DRIVER_LICENSE', 'DURATION', 'EMAIL_ADDRESS', 'FILENAME', 'IP_ADDRESS', 'LOCATION', 'LOCATION_ADDRESS', 'LOCATION_ADDRESS_STREET', 'LOCATION_CITY', 'LOCATION_COORDINATE', 'LOCATION_COUNTRY', 'LOCATION_STATE', 'LOCATION_ZIP', 'MONEY', 'NAME', 'NAME_FAMILY', 'NAME_GIVEN', 'NAME_MEDICAL_PROFESSIONAL', 'NUMERICAL_PII', 'ORGANIZATION', 'OCCUPATION', 'ORIGIN', 'PASSPORT_NUMBER', 'PASSWORD', 'PHONE_NUMBER', 'SSN', 'URL', 'USERNAME', 'VEHICLE_ID'],
    "PCI (Payment Card Industry)": ['BANK_ACCOUNT', 'CREDIT_CARD', 'CREDIT_CARD_EXPIRATION', 'CVV'],
  };

  const handleSelectAll = (category) => {
    const allSelected = filters[category].every((option) =>
      selectedFilters.includes(option)
    );
    if (allSelected) {
      setSelectedFilters(
        selectedFilters.filter((option) => !filters[category].includes(option))
      );
    } else {
      setSelectedFilters([
        ...selectedFilters,
        ...filters[category].filter((option) => !selectedFilters.includes(option)),
      ]);
    }
  };
  const fileToBase64w = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const binaryString = Array.from(new Uint8Array(reader.result)).map(byte => String.fromCharCode(byte)).join('');
        resolve(btoa(binaryString));
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file); // Read as ArrayBuffer
    });
  };
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const binaryString = Array.from(new Uint8Array(reader.result)).map(byte => String.fromCharCode(byte)).join('');
        resolve(btoa(binaryString));
        return binaryString;
      };
      // reader.onerror = (error) => reject(error);
      // reader.readAsArrayBuffer(file); // Read as ArrayBuffer
    });
  };

  // const readFileAsArrayBuffer = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = reject;
  //     reader.readAsArrayBuffer(file);
  //   });
  // };
  const readFileAsArrayBuffer = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/msword') {
      setFileName(file.name);
        // Convert the file to Base64
        const base64File = await fileToBase64(file);

        // Encrypt the Base64 file using AES
        const secretKey = '1234567890123456'; // Replace with your own key
        const encrypted = CryptoJS.AES.encrypt(base64File, secretKey).toString();

        setEncryptedFile(encrypted);
    }
  };

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const handleCheckboxChange = (option) => {
    setSelectedFilters((prevSelected) =>
      prevSelected.includes(option) ? prevSelected.filter((item) => item !== option) : [...prevSelected, option]
    );
  };

  // function encryptData(data, secretKey) {
  //   const iv = CryptoJS.lib.WordArray.random(16);
  //   const encrypted = CryptoJS.AES.encrypt(CryptoJS.lib.WordArray.create(data), CryptoJS.enc.Utf8.parse(secretKey), {
  //     iv: iv,
  //     padding: CryptoJS.pad.Pkcs7,
  //     mode: CryptoJS.mode.CBC
  //   });
  //   return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
  // }

  const redact = async () => {
    setIsLoading(true);
    const secretKey = '1234567890123456';  // AES-128 requires a 16-byte key

    try {
      // const arrayBuffer = await readFileAsArrayBuffer(file);

      const jsonData = {
        text:"",
        image:"",
        docx:base64strImage,
        filters: selectedFilters
      };

      const response = await axios.post("http://13.200.27.54:8182/process-text", jsonData);
      const data = response.data;

      if (fileType === 'image/png' || fileType === 'image/jpeg') {
        setRedactedContent(data.redactedImage);
      } else {
        setRedactedContent(data.redactedText);
      }
    } catch (error) {
      console.error("Error redacting document:", error);
      setRedactedContent("An error occurred while redacting the document.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (fileType === 'image/png' || fileType === 'image/jpeg') {
        const imageBlob = await fetch(`data:${fileType};base64,${redactedContent}`).then(res => res.blob());
        const imageData = [new ClipboardItem({ [fileType]: imageBlob })];
        await navigator.clipboard.write(imageData);
      } else {
        await navigator.clipboard.writeText(redactedContent);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // const handleFileChange = (e) => {
    // const selectedFile = e.target.files[0];
    // setFile(selectedFile);
    // setFileType(selectedFile.type);
  // };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileType(selectedFile.type);
    const file = e.target.files[0];
    setImage(file);
  
    if (file) {
      // Check if the file is a Word document (either .doc or .docx)
      const allowedTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        console.error("Invalid file type. Please upload a Word document.");
        return;
      }
  
      try {
        // Await the result of the Promise that resolves the base64 string
        // const base64Str = fileToBase64(file);
        const f =  await fileToBase64w(selectedFile);
        setbase64StrImage(f);
        // console.log("Word file in text (base64):", base64Str);
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };
  

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>PIReT for Documents</h2>
      
      <div className={styles.uploadArea}>
        <input
          type="file"
          accept=".doc,.docx,.pdf/*"
          onChange={handleFileChange}
          className={styles.fileInput}
          id="fileInput"
        />
        <label htmlFor="fileInput" className={styles.fileInputLabel}>
          <Upload className={styles.uploadIcon} />
          <span>Choose a file</span>
        </label>
        {file && <p className={styles.fileName}>{file.name}</p>}
      </div>

      <div className={styles.filterContainer}>
        <button className={styles.filterButton} onClick={toggleFilter}>
          Filters
        </button>
        {isFilterOpen && (
          <div className={styles.filterOverlay} onClick={toggleFilter}>
            <div className={styles.filterContent} onClick={(e) => e.stopPropagation()}>
              {Object.entries(filters).map(([category, options]) => (
                <div key={category} className={styles.filterCategory}>
                  <div className={styles.filterCategoryHeader}>
                    <input
                      type="checkbox"
                      id={`${category}-select-all`}
                      checked={options.every((option) => selectedFilters.includes(option))}
                      onChange={() => handleSelectAll(category)}
                      className={styles.checkbox}
                    />
                    <h3 className={styles.filterCategoryTitle}>{category}</h3>
                  </div>
                  {options.map((option) => (
                    <div key={option} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        id={option}
                        checked={selectedFilters.includes(option)}
                        onChange={() => handleCheckboxChange(option)}
                        className={styles.checkbox}
                      />
                      <label htmlFor={option} className={styles.filterOptionLabel}>{option}</label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={redact}
        className={styles.redactButton}
        disabled={isLoading || !file}
      >
        {isLoading ? 'Redacting...' : 'Redact Document'}
      </button>

      <div className={styles.resultContainer}>
        {redactedContent ? (
          fileType === 'image/png' || fileType === 'image/jpeg' ? (
            <img
              src={`data:${fileType};base64,${redactedContent}`}
              alt="Redacted Image"
              className={styles.redactedImage}
            />
          ) : (
            <p className={styles.redactedText}>{redactedContent}</p>
          )
        ) : (
          <p className={styles.placeholder}>
            {file ? (
              <>
                <FileText className={styles.placeholderIcon} />
                Redacted content will appear here...
              </>
            ) : (
              <>
                <Image className={styles.placeholderIcon} />
                Upload a document to start
              </>
            )}
          </p>
        )}
        {redactedContent && (
          <button
            onClick={copyToClipboard}
            className={styles.copyButton}
            aria-label="Copy redacted content"
          >
            {isCopied ? <Check className={styles.copyIcon} /> : <Copy className={styles.copyIcon} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentRedaction;