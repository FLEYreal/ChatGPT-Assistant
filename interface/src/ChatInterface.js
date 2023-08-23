// Basic Imports
import { useEffect, useState } from 'react';
import axios from 'axios'

// Styles
import styles from './ChatInterface.module.css'

// Material-UI
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { Box, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';

function ChatInterface() {
    const [configStyles, setConfigStyles] = useState({})
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Состояние для открытия/закрытия Drawer

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setIsDrawerOpen(open);
    };

    useEffect(() => {
        (async () => {
            const res = await axios.get(`${process.env.REACT_APP_API_IP}:${process.env.REACT_APP_API_PORT}/styles/config`)
            if (res.data) {
                setConfigStyles(res.data)
            }
        })()
    }, [])

    return (
        <>
            <Box component='section' className={styles.component} style={configStyles ? {
                width: `${configStyles.width}`,
                height: `${configStyles.height}`
            } : {}}>
                <Box component='header' className={styles.header}>
                    ChatGPT 3.5
                    <IconButton className={styles.burger_menu_button} onClick={toggleDrawer(true)}>
                        <MenuRoundedIcon className={styles.burger_menu_icon} />
                    </IconButton>
                </Box>
                <Box component='section' className={styles.chat} style={configStyles ? {
                    height: `calc(${configStyles.height} - (60px + 110px))`
                } : {}}>
                    <Box className={`${styles.user_message} ${styles.message}`}>

                        <Box className={`${styles.section_user_profile_picture} ${styles.section_profile_picture}`}>
                            <Box className={`${styles.user_profile_picture} ${styles.profile_picture}`}>User</Box>
                        </Box>
                        <Box component='div' className={`${styles.section_user_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </Box>

                    </Box>
                    <Box className={`${styles.gpt_message} ${styles.message}`}>

                        <Box className={`${styles.section_gpt_profile_picture} ${styles.section_profile_picture}`}>
                            <Box className={`${styles.gpt_profile_picture} ${styles.profile_picture}`}>GPT</Box>
                        </Box>
                        <Box className={`${styles.section_gpt_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </Box>

                    </Box>
                </Box>
                <Box component='section' className={styles.input}>
                    <input className={styles.send_message} placeholder="Send Message..." />
                    <Box className={styles.small_message}>
                        Embedded <a href="https://chat.openai.com/">ChatGPT</a> chat by <a href="https://nitro-storm.ru">StormShop</a>
                    </Box>
                </Box>
                <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer(false)} sx={{ '.MuiDrawer-paper': { backgroundColor: '#202123', color: '#C6C6C6' } }}>
                    <Box sx={{ p: 2, fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        <h3 style={{ color: '#C6C6C6', margin: 0 }}>Sidebar Menu</h3>
                    </Box>
                    <List>
                        <ListItem button>
                            <ListItemIcon><LanguageRoundedIcon style={{ color: '#C6C6C6' }} /></ListItemIcon>
                            <ListItemText primary="Language" />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon><RestartAltRoundedIcon style={{ color: '#C6C6C6' }} /></ListItemIcon>
                            <ListItemText primary="Start New Conversation" />
                        </ListItem>
                    </List>
                    <Box sx={{ p: 2, mt: 'auto',  fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        <h5 style={{ color: '#7a7a7a', margin: 0 }}>Component made by StormShop</h5>
                    </Box>
                </Drawer>
            </Box>
        </>
    );
}

export default ChatInterface;
