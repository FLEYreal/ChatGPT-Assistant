import { useEffect, useState } from 'react';

import styles from './ChatInterface.module.css'
import axios from 'axios'

function ChatInterface() {
    const [configStyles, setConfigStyles] = useState({})

    useEffect(() => {
        (async () => {
            const res = await axios.get(`${process.env.REACT_APP_API_IP}:${process.env.REACT_APP_API_PORT}/styles/config`)
            if (res.data) {
                setConfigStyles(res.data)
            }
        })()
    }, [])

    useEffect(() => console.log(configStyles), [configStyles])

    return (
        <>
            <section className={styles.component} style={configStyles ? {
                width: `${configStyles.width}`,
                height: `${configStyles.height}`
            } : {}}>
                <header className={styles.header}>
                    ChatGPT 3.5
                    <button className={styles.burger_menu_button}>{/*<img className={styles.burger-menu-icon} alt="burger-menu-icon" src="/icons/burger_menu_icon.svg" />*/}</button>
                </header>
                <section className={styles.chat} style={configStyles ? {
                    height: `calc(${configStyles.height} - (60px + 110px))`
                } : {}}>
                    <div className={`${styles.user_message} ${styles.message}`}>

                        <div className={`${styles.section_user_profile_picture} ${styles.section_profile_picture}`}>
                            <div className={`${styles.user_profile_picture} ${styles.profile_picture}`}>User</div>
                        </div>
                        <div className={`${styles.section_user_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </div>

                    </div>
                    <div className={`${styles.gpt_message} ${styles.message}`}>

                        <div className={`${styles.section_gpt_profile_picture} ${styles.section_profile_picture}`}>
                            <div className={`${styles.gpt_profile_picture} ${styles.profile_picture}`}>GPT</div>
                        </div>
                        <div className={`${styles.section_gpt_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </div>

                    </div>
                    <div className={`${styles.user_message} ${styles.message}`}>

                        <div className={`${styles.section_user_profile_picture} ${styles.section_profile_picture}`}>
                            <div className={`${styles.user_profile_picture} ${styles.profile_picture}`}>User</div>
                        </div>
                        <div className={`${styles.section_user_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </div>

                    </div>
                    <div className={`${styles.gpt_message} ${styles.message}`}>

                        <div className={`${styles.section_gpt_profile_picture} ${styles.section_profile_picture}`}>
                            <div className={`${styles.gpt_profile_picture} ${styles.profile_picture}`}>GPT</div>
                        </div>
                        <div className={`${styles.section_gpt_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </div>

                    </div>
                    <div className={`${styles.user_message} ${styles.message}`}>

                        <div className={`${styles.section_user_profile_picture} ${styles.section_profile_picture}`}>
                            <div className={`${styles.user_profile_picture} ${styles.profile_picture}`}>User</div>
                        </div>
                        <div className={`${styles.section_user_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </div>

                    </div>
                    <div className={`${styles.gpt_message} ${styles.message}`}>

                        <div className={`${styles.section_gpt_profile_picture} ${styles.section_profile_picture}`}>
                            <div className={`${styles.gpt_profile_picture} ${styles.profile_picture}`}>GPT</div>
                        </div>
                        <div className={`${styles.section_gpt_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </div>

                    </div>
                    <div className={`${styles.user_message} ${styles.message}`}>

                        <div className={`${styles.section_user_profile_picture} ${styles.section_profile_picture}`}>
                            <div className={`${styles.user_profile_picture} ${styles.profile_picture}`}>User</div>
                        </div>
                        <div className={`${styles.section_user_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </div>

                    </div>
                    <div className={`${styles.gpt_message} ${styles.message}`}>

                        <div className={`${styles.section_gpt_profile_picture} ${styles.section_profile_picture}`}>
                            <div className={`${styles.gpt_profile_picture} ${styles.profile_picture}`}>GPT</div>
                        </div>
                        <div className={`${styles.section_gpt_message_text} ${styles.section_message_text}`}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, atque? Praesentium, quibusdam!
                            Perspiciatis ea a magnam distinctio, at cum quis?
                        </div>

                    </div>
                </section>
                <section className={styles.input}>
                    <input className={styles.send_message} placeholder="Send Message..." />
                    <div className={styles.small_message}>
                        Embedded <a href="https://chat.openai.com/">ChatGPT</a> chat by <a href="https://nitro-storm.ru">StormShop</a>
                    </div>
                </section>
            </section>
            <aside className={styles.drawer}>

            </aside>
        </>
    );
}

export default ChatInterface;
