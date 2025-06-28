        // ข้อมูลเกม - ใช้ shared storage จำลอง
        let gameData = {
            rooms: [],
            currentRoom: null,
            currentPlayer: null,
            gameStarted: false
        };

        // จำลอง shared storage ด้วย localStorage (สำหรับ demo)
        function saveGameData() {
            try {
                const data = JSON.stringify(gameData);
                // ใช้ custom event เพื่อ sync ข้อมูลระหว่าง tabs
                window.dispatchEvent(new CustomEvent('gameDataUpdate', { detail: data }));
            } catch (e) {
                console.log('Demo mode - data stored in memory only');
            }
        }

        function loadGameData() {
            try {
                // ในการใช้งานจริงจะต้องใช้ WebSocket หรือ Server
                // ตอนนี้เป็นการจำลองเท่านั้น
                return gameData;
            } catch (e) {
                return gameData;
            }
        }

        // ฟังก์ชันอัปเดตข้อมูลแบบ real-time จำลอง
        function syncGameData() {
            // ในการใช้งานจริงจะต้องใช้ WebSocket
            // ตอนนี้เป็นการจำลองเท่านั้น
            if (gameData.currentRoom) {
                updatePlayersList();
                updateRoomsList();
            }
        }

        // เพิ่มข้อมูลห้องตัวอย่างเพื่อการทดสอบ
        function addSampleRooms() {
            const sampleRooms = [
                {
                    id: 'demo001',
                    name: 'ห้องทดสอบ 1',
                    host: 'Admin',
                    maxPlayers: 8,
                    players: ['Admin', 'Player1'],
                    roles: { 'ชาวบ้าน': 4, 'หมาป่า': 2, 'ผู้หยั่งรู้': 1, 'บอดี้การ์ด': 1 },
                    gameStarted: false
                },
                {
                    id: 'demo002',
                    name: 'ห้องผู้เริ่มต้น',
                    host: 'NewPlayer',
                    maxPlayers: 6,
                    players: ['NewPlayer'],
                    roles: { 'ชาวบ้าน': 3, 'หมาป่า': 2, 'ผู้หยั่งรู้': 1 },
                    gameStarted: false
                }
            ];
            
            // เพิ่มห้องตัวอย่างถ้ายังไม่มีห้องใด
            if (gameData.rooms.length === 0) {
                gameData.rooms = sampleRooms;
                saveGameData();
            }
        }

        // ข้อมูลบทบาท
        const roles = {
            'ชาวบ้าน': 'คุณเป็นชาวบ้านธรรมดา เป้าหมายของคุณคือหาหมาป่าให้ได้และกำจัดออกจากหมู่บ้าน',
            'หมาป่า': 'คุณเป็นหมาป่า เป้าหมายของคุณคือกินชาวบ้านทุกคนโดยไม่ให้ถูกจับได้',
            'ผู้หยั่งรู้': 'คุณสามารถตรวจสอบตัวตนที่แท้จริงของผู้เล่นคนหนึ่งได้ในแต่ละคืน',
            'ลูกหมาป่า': 'คุณเป็นหมาป่าตัวเล็ก ทำงานร่วมกับหมาป่าตัวใหญ่ แต่ยังไม่สามารถฆ่าคนได้',
            'ผู้ล้างแค้น': 'เมื่อคุณถูกฆ่า คุณสามารถเลือกคนหนึ่งเพื่อพาไปด้วยได้',
            'คนบ้า': 'คุณชนะเมื่อถูกประหารชีวิตโดยชาวบ้าน เป้าหมายของคุณคือทำให้คนอื่นสงสัยในตัวคุณ',
            'บอดี้การ์ด': 'คุณสามารถปกป้องผู้เล่นคนหนึ่งจากการถูกฆ่าในแต่ละคืนได้',
            'ผู้นำลัทธิ': 'คุณสามารถแปลงผู้เล่นคนหนึ่งให้เป็นสมาชิกลัทธิของคุณได้ในแต่ละคืน'
        };

        // ฟังก์ชันสำหรับสร้าง ID สุ่ม
        function generateId() {
            return Math.random().toString(36).substr(2, 9);
        }

        // แสดงหน้าหลัก
        function showMainScreen() {
            document.getElementById('main-screen').classList.remove('hidden');
            document.getElementById('create-room-screen').classList.add('hidden');
            document.getElementById('join-room-screen').classList.add('hidden');
            document.getElementById('room-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.add('hidden');
            
            // เพิ่มห้องตัวอย่างเพื่อการทดสอบ
            addSampleRooms();
            updateRoomsList();
        }

        // แสดงหน้าสร้างห้อง
        function showCreateRoom() {
            document.getElementById('main-screen').classList.add('hidden');
            document.getElementById('create-room-screen').classList.remove('hidden');
            generateRolesConfig();
        }

        // แสดงหน้าเข้าร่วมห้อง
        function showJoinRoom() {
            document.getElementById('main-screen').classList.add('hidden');
            document.getElementById('join-room-screen').classList.remove('hidden');
        }

        // สร้างการกำหนดค่าบทบาท
        function generateRolesConfig() {
            const rolesConfig = document.getElementById('roles-config');
            rolesConfig.innerHTML = '';
            
            Object.keys(roles).forEach(role => {
                const roleItem = document.createElement('div');
                roleItem.className = 'role-item';
                roleItem.innerHTML = `
                    <label>${role}:</label>
                    <input type="number" id="role-${role}" min="0" max="5" value="${role === 'ชาวบ้าน' ? '4' : role === 'หมาป่า' ? '2' : '1'}" onchange="updateRoleCount()">
                `;
                rolesConfig.appendChild(roleItem);
            });
        }

        // อัปเดตจำนวนบทบาท
        function updateRoleCount() {
            const maxPlayers = parseInt(document.getElementById('max-players').value);
            let totalRoles = 0;
            
            Object.keys(roles).forEach(role => {
                const input = document.getElementById(`role-${role}`);
                totalRoles += parseInt(input.value) || 0;
            });
            
            if (totalRoles > maxPlayers) {
                alert(`จำนวนบทบาททั้งหมดต้องไม่เกิน ${maxPlayers} คน`);
            }
        }

        // สร้างห้อง
        function createRoom() {
            const roomName = document.getElementById('room-name').value.trim();
            const hostName = document.getElementById('host-name').value.trim();
            const maxPlayers = parseInt(document.getElementById('max-players').value);
            
            if (!roomName || !hostName) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            
            // ตรวจสอบชื่อซ้ำ
            const existingRoom = gameData.rooms.find(r => r.name.toLowerCase() === roomName.toLowerCase());
            if (existingRoom) {
                alert('มีห้องชื่อนี้อยู่แล้ว กรุณาเลือกชื่ออื่น');
                return;
            }
            
            // รวบรวมข้อมูลบทบาท
            const gameRoles = {};
            let totalRoles = 0;
            
            Object.keys(roles).forEach(role => {
                const count = parseInt(document.getElementById(`role-${role}`).value) || 0;
                if (count > 0) {
                    gameRoles[role] = count;
                    totalRoles += count;
                }
            });
            
            if (totalRoles === 0) {
                alert('กรุณาเลือกบทบาทอย่างน้อย 1 บทบาท');
                return;
            }
            
            if (totalRoles > maxPlayers) {
                alert(`จำนวนบทบาททั้งหมดต้องไม่เกิน ${maxPlayers} คน`);
                return;
            }
            
            const room = {
                id: generateId(),
                name: roomName,
                host: hostName,
                maxPlayers: maxPlayers,
                players: [hostName],
                roles: gameRoles,
                gameStarted: false,
                createdAt: new Date().toISOString()
            };
            
            gameData.rooms.push(room);
            gameData.currentRoom = room;
            gameData.currentPlayer = hostName;
            
            saveGameData();
            showRoom();
            
            // แสดงข้อความยืนยัน
            alert(`สร้างห้อง "${roomName}" เรียบร้อยแล้ว!\nรหัสห้อง: ${room.id}\nแชร์รหัสนี้ให้เพื่อนเพื่อเข้าร่วม`);
        }

        // เข้าร่วมห้อง
        function joinRoom() {
            const playerName = document.getElementById('player-name').value.trim();
            const roomId = document.getElementById('room-id').value.trim();
            
            if (!playerName || !roomId) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            
            // โหลดข้อมูลล่าสุด
            gameData = loadGameData();
            
            const room = gameData.rooms.find(r => r.id === roomId);
            if (!room) {
                alert('ไม่พบห้องที่ระบุ กรุณาตรวจสอบรหัสห้องอีกครั้ง');
                return;
            }
            
            if (room.players.length >= room.maxPlayers) {
                alert('ห้องเต็มแล้ว ไม่สามารถเข้าร่วมได้');
                return;
            }
            
            if (room.players.some(p => p.toLowerCase() === playerName.toLowerCase())) {
                alert('ชื่อนี้ถูกใช้แล้วในห้อง กรุณาเลือกชื่ออื่น');
                return;
            }
            
            if (room.gameStarted) {
                alert('เกมเริ่มแล้ว ไม่สามารถเข้าร่วมได้');
                return;
            }
            
            room.players.push(playerName);
            gameData.currentRoom = room;
            gameData.currentPlayer = playerName;
            
            saveGameData();
            showRoom();
            
            // แสดงข้อความยืนยัน
            alert(`เข้าร่วมห้อง "${room.name}" เรียบร้อยแล้ว!`);
        }

        // แสดงห้องรอ
        function showRoom() {
            document.getElementById('main-screen').classList.add('hidden');
            document.getElementById('create-room-screen').classList.add('hidden');
            document.getElementById('join-room-screen').classList.add('hidden');
            document.getElementById('room-screen').classList.remove('hidden');
            document.getElementById('game-screen').classList.add('hidden');
            
            const room = gameData.currentRoom;
            document.getElementById('current-room-name').textContent = room.name;
            document.getElementById('room-code').textContent = `รหัสห้อง: ${room.id}`;
            document.getElementById('player-count').textContent = room.players.length;
            document.getElementById('max-player-count').textContent = room.maxPlayers;
            
            // แสดงปุ่มควบคุมสำหรับเจ้าของห้อง
            if (gameData.currentPlayer === room.host) {
                document.getElementById('host-controls').classList.remove('hidden');
            } else {
                document.getElementById('host-controls').classList.add('hidden');
            }
            
            // แสดงรายชื่อผู้เล่น
            updatePlayersList();
            
            // แสดงบทบาทที่จะใช้
            updateGameRolesDisplay();
        }

        // อัปเดตรายชื่อผู้เล่น
        function updatePlayersList() {
            const playersList = document.getElementById('players-list');
            const room = gameData.currentRoom;
            
            playersList.innerHTML = '';
            room.players.forEach(player => {
                const playerCard = document.createElement('div');
                playerCard.className = 'player-card';
                playerCard.innerHTML = `
                    ${player}
                    ${player === room.host ? ' 👑' : ''}
                `;
                playersList.appendChild(playerCard);
            });
        }

        // แสดงบทบาทที่จะใช้ในเกม
        function updateGameRolesDisplay() {
            const display = document.getElementById('game-roles-display');
            const room = gameData.currentRoom;
            
            display.innerHTML = '';
            Object.entries(room.roles).forEach(([role, count]) => {
                const roleDiv = document.createElement('div');
                roleDiv.style.cssText = 'display: inline-block; margin: 5px; padding: 8px 12px; background: #f8f9fa; border-radius: 5px; border: 1px solid #e9ecef;';
                roleDiv.textContent = `${role} x${count}`;
                display.appendChild(roleDiv);
            });
        }

        // เริ่มเกม
        function startGame() {
            const room = gameData.currentRoom;
            
            if (room.players.length < 3) {
                alert('ต้องมีผู้เล่นอย่างน้อย 3 คนเพื่อเริ่มเกม');
                return;
            }
            
            // สุ่มบทบาท
            const allRoles = [];
            Object.entries(room.roles).forEach(([role, count]) => {
                for (let i = 0; i < count; i++) {
                    allRoles.push(role);
                }
            });
            
            // เติมด้วยชาวบ้านหากจำนวนบทบาทไม่เพียงพอ
            while (allRoles.length < room.players.length) {
                allRoles.push('ชาวบ้าน');
            }
            
            // สุ่มแจกบทบาท
            const shuffledRoles = allRoles.sort(() => Math.random() - 0.5);
            room.playerRoles = {};
            room.players.forEach((player, index) => {
                room.playerRoles[player] = shuffledRoles[index];
            });
            
            room.gameStarted = true;
            gameData.gameStarted = true;
            
            showGame();
        }

        // แสดงหน้าเกม
        function showGame() {
            document.getElementById('room-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');
            
            const room = gameData.currentRoom;
            const playerRole = room.playerRoles[gameData.currentPlayer];
            
            document.getElementById('player-role').textContent = playerRole;
            document.getElementById('role-description').textContent = roles[playerRole];
        }

        // แสดงบทบาท
        function showRole() {
            const room = gameData.currentRoom;
            const playerRole = room.playerRoles[gameData.currentPlayer];
            
            document.getElementById('modal-role-name').textContent = playerRole;
            document.getElementById('modal-role-description').textContent = roles[playerRole];
            document.getElementById('role-modal').classList.remove('hidden');
        }

        // ซ่อน Modal บทบาท
        function hideRoleModal() {
            document.getElementById('role-modal').classList.add('hidden');
        }

        // กลับห้องรอ
        function backToRoom() {
            gameData.currentRoom.gameStarted = false;
            gameData.gameStarted = false;
            showRoom();
        }

        // ออกจากห้อง
        function leaveRoom() {
            const room = gameData.currentRoom;
            room.players = room.players.filter(p => p !== gameData.currentPlayer);
            
            // หากเจ้าของห้องออก ให้ลบห้อง
            if (gameData.currentPlayer === room.host) {
                gameData.rooms = gameData.rooms.filter(r => r.id !== room.id);
            }
            
            gameData.currentRoom = null;
            gameData.currentPlayer = null;
            gameData.gameStarted = false;
            
            showMainScreen();
        }

        // ลบห้อง
        function deleteRoom() {
            if (confirm('คุณแน่ใจหรือไม่ที่จะลบห้องนี้?')) {
                gameData.rooms = gameData.rooms.filter(r => r.id !== gameData.currentRoom.id);
                gameData.currentRoom = null;
                gameData.currentPlayer = null;
                gameData.gameStarted = false;
                showMainScreen();
            }
        }

        // อัปเดตรายการห้อง
        function updateRoomsList() {
            const roomsList = document.getElementById('rooms-list');
            
            if (gameData.rooms.length === 0) {
                roomsList.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <p style="color: #636e72; font-size: 18px; margin-bottom: 15px;">ยังไม่มีห้องที่เปิดอยู่</p>
                        <p style="color: #74b9ff; font-size: 14px;">
                            💡 สร้างห้องใหม่เพื่อเริ่มเล่นกับเพื่อน<br>
                            หรือรอให้คนอื่นสร้างห้องแล้วเข้าร่วม
                        </p>
                    </div>
                `;
                return;
            }
            
            roomsList.innerHTML = '';
            gameData.rooms.forEach(room => {
                const roomCard = document.createElement('div');
                roomCard.className = 'room-card';
                
                const statusColor = room.gameStarted ? '#e17055' : '#00b894';
                const statusText = room.gameStarted ? 'กำลังเล่น' : 'เปิดรับสมาชิก';
                const buttonHtml = room.gameStarted ? 
                    `<span style="color: ${statusColor}; font-weight: bold;">🎮 ${statusText}</span>` : 
                    `<button class="btn btn-secondary" onclick="quickJoin('${room.id}')" ${room.players.length >= room.maxPlayers ? 'disabled' : ''}>
                        ${room.players.length >= room.maxPlayers ? 'เต็มแล้ว' : 'เข้าร่วม'}
                    </button>`;
                
                roomCard.innerHTML = `
                    <div class="room-info">
                        <h3>🏠 ${room.name}</h3>
                        <p>👑 เจ้าของห้อง: <strong>${room.host}</strong></p>
                        <p>👥 ผู้เล่น: <strong>${room.players.length}/${room.maxPlayers}</strong> คน</p>
                        <p>🔑 รหัสห้อง: <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${room.id}</code></p>
                        <p style="font-size: 12px; color: #636e72;">
                            🎭 บทบาท: ${Object.entries(room.roles).map(([role, count]) => `${role}(${count})`).join(', ')}
                        </p>
                    </div>
                    <div style="text-align: center;">
                        ${buttonHtml}
                        <div style="margin-top: 8px;">
                            <span style="color: ${statusColor}; font-size: 12px;">● ${statusText}</span>
                        </div>
                    </div>
                `;
                roomsList.appendChild(roomCard);
            });
        }

        // เข้าร่วมห้องแบบเร็ว
        function quickJoin(roomId) {
            const playerName = prompt('กรุณาใส่ชื่อของคุณ:');
            if (!playerName) return;
            
            const room = gameData.rooms.find(r => r.id === roomId);
            if (!room) {
                alert('ไม่พบห้องที่ระบุ');
                return;
            }
            
            if (room.players.length >= room.maxPlayers) {
                alert('ห้องเต็มแล้ว');
                return;
            }
            
            if (room.players.includes(playerName.trim())) {
                alert('ชื่อนี้ถูกใช้แล้วในห้อง');
                return;
            }
            
            if (room.gameStarted) {
                alert('เกมเริ่มแล้ว ไม่สามารถเข้าร่วมได้');
                return;
            }
            
            room.players.push(playerName.trim());
            gameData.currentRoom = room;
            gameData.currentPlayer = playerName.trim();
            
            showRoom();
        }

        // เริ่มต้นแอป
        document.addEventListener('DOMContentLoaded', function() {
            showMainScreen();
            
            // ปิด Modal เมื่อคลิกนอกพื้นที่
            document.getElementById('role-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    hideRoleModal();
                }
            });
        });