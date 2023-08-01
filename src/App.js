import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import { Button,Box, Grid, CircularProgress, Backdrop, Typography, Divider, TextField } from '@mui/material'
import axios from 'axios'

export default function App() {
  const uploadedDoc = useRef(null)
  const [rows, setRows] = useState([])
  const [previewFile, setPreviewFile] = useState("")
  const [loadingUpload,setLoadingUpload] = useState(false)
  const url = 'http://localhost:1111/'

  const handleUpload = async (e) => {
    setLoadingUpload(true)
      let reader = new FileReader()
      let file = e.target.files[0]
      // setDocumentFile(file)
      reader.readAsDataURL(file)

      const formData = new FormData()
      formData.append('document', file)
      axios.post(`${url}pdf-to-img`, formData).then(async res=>{
        if(res.data.image.length > 0) {
          setPreviewFile(res.data?.pdf)
          axios.post(`${url}ocr`, {msg: res.data.image}).then(async response=>{
            setRows(response.data)
            setLoadingUpload(false)
          }).catch(err=>alert(err))
        }
      }).catch(err => alert(err));
  }

  const handleChange = (index, key, newValue) => {
    const updatedRows = rows.map((item, i) => {
      if (i === index) {
        return { ...item, [key]: newValue };
      }
      return item;
    });
    setRows(updatedRows);
  };

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: 99999 }}
        open={loadingUpload}
        onClick={() => setLoadingUpload(false)}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          alignItems: 'center',
        }}>
          <Grid container>
            <Grid item md={6}>
              <Button style={{margin:30}}
              variant='contained'
              component='label'>
              Upload PDF
              <input
                type='file'
                draggable='true'
                hidden
                ref={uploadedDoc}
                onChange={handleUpload}
                onClick={(e) => (e.target.value = null)}
              />
              </Button>
              {
                previewFile ?
                <iframe
                  src={url+previewFile}
                  style={{
                    width: '100%',
                    height: 700,
                    border: 'none',
                  }}
                />:
                <img src={url + "repo/image/no-data.jpg"} 
                style={{
                  height: 500,
                  border: 'none',
                }}/>
              }
            </Grid>
            <Grid item md={6}>
              {
                rows.map((item,i)=>(
                  <Box sx={{p:1}}>
                    <Typography sx={{ml:1,mb:1}}>Halaman {i+1}</Typography>
                    <Grid container>
                      {Object.entries(item).map(([key, value]) => (
                          <TextField
                            id={key}
                            label={key}
                            value={value}
                            sx={{m:1}}
                            onChange={(e) => handleChange(i, key, e.target.value)}
                          />
                        ))}
                    </Grid>
                    <Divider sx={{mt:2}}/>
                  </Box>
                ))
              }
            </Grid>
          </Grid>
      </Box>
      </>
  )
}
