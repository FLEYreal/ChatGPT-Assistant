// Basic Imports
import { useEffect, useState } from 'react';
import axios from 'axios'

// Styles
import styles from './ChatInterface.module.css'

// Material-UI
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { Box, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';

function ChatInterface() {
    const [configStyles, setConfigStyles] = useState({}) // Styles from config.styles.js
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State to open/close Drawer

    // Toggles drawer
    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setIsDrawerOpen(open);
    };

    useEffect(() => {
        (async () => {
            // Get configurable styles from API
            const res = await axios.get(`${process.env.REACT_APP_API_IP}:${process.env.REACT_APP_API_PORT}/styles/config`)
            if (res.data) {
                // Set styles to State
                setConfigStyles(res.data)
            }
        })()
    }, [])

    return (
        <>
            {/* Main component */}
            <Box component='section' className={styles.component} style={configStyles ? {
                // Define size of the component from "config.styles.js"
                width: `${configStyles.width}`,
                height: `${configStyles.height}`
            } : {}}>
                {/* Header of the module, has a title with the name and Burger Icon to open Drawer */}
                <Box component='header' className={styles.header}>
                    {/* Title */}
                    ChatGPT 3.5

                    {/* Icon */}
                    <IconButton className={styles.burger_menu_button} onClick={toggleDrawer(true)}>
                        <MenuRoundedIcon className={styles.burger_menu_icon} />
                    </IconButton>
                </Box>

                {/* Chat itself */}
                <Box component='section' className={styles.chat} style={configStyles ? {
                    // Defines a height of the chat substracting size of header and input
                    height: `calc(${configStyles.height} - (60px + 110px))`
                } : {}}>

                    {/* Message box */}
                    <Box className={`${styles.user_message} ${styles.message}`}>

                        {/* Icon of the user / gpt */}
                        <Box className={`${styles.section_user_profile_picture} ${styles.section_profile_picture}`}>
                            <Box className={`${styles.user_profile_picture} ${styles.profile_picture}`}>User</Box>
                        </Box>

                        {/* Message content */}
                        <Box component='div' className={`${styles.section_user_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </Box>

                    </Box>

                    {/* Message box */}

                    <Box className={`${styles.gpt_message} ${styles.message}`}>

                        {/* Icon of the user / gpt */}
                        <Box className={`${styles.section_gpt_profile_picture} ${styles.section_profile_picture}`}>
                            <Box className={`${styles.gpt_profile_picture} ${styles.profile_picture}`}>GPT</Box>
                        </Box>

                        {/* Message content */}
                        <Box className={`${styles.section_gpt_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </Box>

                    </Box>
                </Box>

                {/* Input to send messages to GPT */}
                <Box component='section' className={styles.input}>

                    {/* Input itself */}
                    <input className={styles.send_message} placeholder="Send Message..." />

                    {/* a P.S. under input */}
                    <Box className={styles.small_message}>
                        Embedded <a href="https://chat.openai.com/">ChatGPT</a> chat by <a href="https://nitro-storm.ru">StormShop</a>
                    </Box>
                </Box>

                {/* Drawer / Sidebar that opens when clicked on Burger icon in Header */}
                <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer(false)} sx={{ '.MuiDrawer-paper': { backgroundColor: '#202123', color: '#C6C6C6' } }}>
                    
                    {/* Title of the Sidebar */}
                    <Box sx={{ p: 2, fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        <h3 style={{ color: '#C6C6C6', margin: 0 }}>Sidebar Menu</h3>
                    </Box>

                    {/* List of items in Sidebar */}
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

                    {/* a P.S. of the sidebar */}
                    <Box sx={{ p: 2, mt: 'auto',  fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        <h5 style={{ color: '#7a7a7a', margin: 0 }}>Component made by StormShop</h5>
                    </Box>
                </Drawer>
            </Box>
        </>
    );
}

export default ChatInterface;
