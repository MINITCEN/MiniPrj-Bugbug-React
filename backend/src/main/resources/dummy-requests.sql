-- Dummy requests seed
-- 게시물 20개: 대기 중 10, 예약 완료 4, 완료 6
-- 완료 건은 chat_rooms + applications + reviews 함께 생성

SET @u01 := (SELECT user_id FROM users WHERE email = 'user01@bugbug.local');
SET @u02 := (SELECT user_id FROM users WHERE email = 'user02@bugbug.local');
SET @u03 := (SELECT user_id FROM users WHERE email = 'user03@bugbug.local');
SET @u04 := (SELECT user_id FROM users WHERE email = 'user04@bugbug.local');
SET @u05 := (SELECT user_id FROM users WHERE email = 'user05@bugbug.local');
SET @u06 := (SELECT user_id FROM users WHERE email = 'user06@bugbug.local');
SET @u07 := (SELECT user_id FROM users WHERE email = 'user07@bugbug.local');
SET @u08 := (SELECT user_id FROM users WHERE email = 'user08@bugbug.local');
SET @u09 := (SELECT user_id FROM users WHERE email = 'user09@bugbug.local');
SET @u10 := (SELECT user_id FROM users WHERE email = 'user10@bugbug.local');
SET @u11 := (SELECT user_id FROM users WHERE email = 'user11@bugbug.local');
SET @u12 := (SELECT user_id FROM users WHERE email = 'user12@bugbug.local');
SET @u13 := (SELECT user_id FROM users WHERE email = 'user13@bugbug.local');

SET @h01 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter01@bugbug.local');
SET @h02 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter02@bugbug.local');
SET @h03 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter03@bugbug.local');
SET @h04 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter04@bugbug.local');
SET @h05 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter05@bugbug.local');
SET @h06 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter06@bugbug.local');
SET @h07 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter07@bugbug.local');
SET @h08 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter08@bugbug.local');
SET @h09 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter09@bugbug.local');
SET @h10 := (SELECT h.hunter_id FROM hunters h JOIN users u ON h.user_id = u.user_id WHERE u.email = 'hunter10@bugbug.local');

-- ============================================================
-- 의뢰 20건 (title 기준 idempotent)
-- ============================================================

-- 1. 대기 중 (10건)
INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u01, '대기 중', '[강남구] 침실에 모기가 너무 많아요', '밤마다 모기 소리에 잠을 못 잡니다', '창문 방충망 점검 부탁드립니다', '강남구', '강남구 역삼동 우림아파트 101동', NOW() - INTERVAL 2 DAY, 87, NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[강남구] 침실에 모기가 너무 많아요');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u02, '대기 중', '[중구] 부엌에서 바퀴벌레 발견', '싱크대 아래에서 큰 바퀴 한 마리 봤습니다', '근처에 알이 있을까봐 걱정됩니다', '중구', '중구 명동 빌라 3층', NOW() - INTERVAL 3 DAY, 132, NOW() - INTERVAL 2 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[중구] 부엌에서 바퀴벌레 발견');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u03, '대기 중', '[서초구] 베란다에 개미가 줄지어 다녀요', '베란다 화분 주변으로 개미 행렬', '약 2미터 정도 줄지어 이동 중', '서초구', '서초구 반포동 자이아파트', NOW() - INTERVAL 1 DAY, 45, NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[서초구] 베란다에 개미가 줄지어 다녀요');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u04, '대기 중', '[송파구] 천장에서 쥐 소리가 납니다', '밤에 천장에서 뛰어다니는 소리', '한 마리가 아닌 것 같습니다', '송파구', '송파구 잠실동 단독주택', NOW() - INTERVAL 5 DAY, 98, NOW() - INTERVAL 3 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[송파구] 천장에서 쥐 소리가 납니다');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u05, '대기 중', '[마포구] 베란다에 벌집이 생겼어요', '말벌로 보이는 벌이 집을 짓는 중', '아이가 있어서 빨리 처리해주세요', '마포구', '마포구 연남동 다세대 2층', NOW() - INTERVAL 2 DAY, 76, NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[마포구] 베란다에 벌집이 생겼어요');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u06, '대기 중', '[용산구] 욕실에서 지네가 나왔습니다', '샤워 중 지네 한 마리 발견', '비 오는 날에 자주 보입니다', '용산구', '용산구 한남동 빌라 1층', NOW() - INTERVAL 4 DAY, 54, NOW() - INTERVAL 2 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[용산구] 욕실에서 지네가 나왔습니다');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u07, '대기 중', '[성동구] 창문틈 거미줄 처리 부탁드려요', '큰 거미가 자꾸 들어옵니다', '거미줄도 여기저기', '성동구', '성동구 성수동 오피스텔', NOW() - INTERVAL 1 DAY, 31, NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[성동구] 창문틈 거미줄 처리 부탁드려요');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u08, '대기 중', '[광진구] 주방에 날파리가 너무 많아요', '음식물 쓰레기통 주변에 날파리 떼', '청소해도 계속 생깁니다', '광진구', '광진구 자양동 아파트 502호', NOW() - INTERVAL 6 DAY, 112, NOW() - INTERVAL 4 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[광진구] 주방에 날파리가 너무 많아요');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u09, '대기 중', '[강동구] 거실까지 모기가 들어옵니다', '방충망에 구멍이 있는 듯', '점검 + 방제 같이 가능한가요', '강동구', '강동구 천호동 빌라', NOW() - INTERVAL 2 DAY, 67, NOW() - INTERVAL 2 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[강동구] 거실까지 모기가 들어옵니다');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u10, '대기 중', '[동작구] 화장실 배수구에서 바퀴 발견', '배수구 타고 올라오는 듯', '근본 차단 필요합니다', '동작구', '동작구 상도동 원룸 4층', NOW() - INTERVAL 3 DAY, 89, NOW() - INTERVAL 2 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[동작구] 화장실 배수구에서 바퀴 발견');

-- 2. 예약 완료 (4건) — chat_rooms + applications 동반
INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u11, '예약 완료', '[영등포구] 사무실 개미 떼 방제 요청', '회의실 바닥 개미 행렬', '주말 방문 가능한지요', '영등포구', '영등포구 여의도동 IFC몰 근처', NOW() - INTERVAL 7 DAY, 145, NOW() - INTERVAL 5 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[영등포구] 사무실 개미 떼 방제 요청');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u12, '예약 완료', '[구로구] 다용도실 쥐 흔적 발견', '쌀포대에 구멍이 났습니다', '쥐덫 + 약 같이 시공 부탁', '구로구', '구로구 구로동 빌라 반지하', NOW() - INTERVAL 8 DAY, 121, NOW() - INTERVAL 6 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[구로구] 다용도실 쥐 흔적 발견');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u13, '예약 완료', '[관악구] 옥상 처마에 말벌집', '말벌집 직경 약 20cm', '높아서 사다리 필요', '관악구', '관악구 봉천동 다세대 옥상', NOW() - INTERVAL 6 DAY, 156, NOW() - INTERVAL 4 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[관악구] 옥상 처마에 말벌집');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at)
SELECT @u01, '예약 완료', '[종로구] 한옥 마당 모기 방제', '한옥이라 모기 유입이 많음', '연막 가능한지', '종로구', '종로구 가회동 한옥', NOW() - INTERVAL 5 DAY, 78, NOW() - INTERVAL 3 DAY
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[종로구] 한옥 마당 모기 방제');

-- 3. 완료 (6건) — chat_rooms + applications + reviews + completed_hunter_id 동반
INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at, completed_hunter_id)
SELECT @u02, '완료', '[양천구] 부엌 바퀴벌레 완전 방제', '싱크대 + 후드 점검 후 방제 완료', '재방문 안내까지 받음', '양천구', '양천구 신정동 아파트 7층', NOW() - INTERVAL 15 DAY, 203, NOW() - INTERVAL 12 DAY, @h05
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[양천구] 부엌 바퀴벌레 완전 방제');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at, completed_hunter_id)
SELECT @u03, '완료', '[강서구] 욕실 지네 박멸 의뢰', '벽 틈새 차단 + 약 시공', '재발 없음 확인', '강서구', '강서구 화곡동 빌라', NOW() - INTERVAL 20 DAY, 167, NOW() - INTERVAL 17 DAY, @h06
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[강서구] 욕실 지네 박멸 의뢰');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at, completed_hunter_id)
SELECT @u04, '완료', '[노원구] 천장 쥐 퇴치 완료', '쥐덫 설치 + 침입 경로 차단', '소리 없어졌습니다', '노원구', '노원구 상계동 다세대', NOW() - INTERVAL 18 DAY, 134, NOW() - INTERVAL 15 DAY, @h07
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[노원구] 천장 쥐 퇴치 완료');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at, completed_hunter_id)
SELECT @u05, '완료', '[도봉구] 거실 모기 종합 방제', '연막 + 방충망 보수', '깔끔하게 처리됨', '도봉구', '도봉구 창동 아파트', NOW() - INTERVAL 22 DAY, 178, NOW() - INTERVAL 19 DAY, @h08
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[도봉구] 거실 모기 종합 방제');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at, completed_hunter_id)
SELECT @u06, '완료', '[은평구] 베란다 거미 청소', '거미줄 제거 + 외부 차단', '시간 좀 더 걸렸음', '은평구', '은평구 불광동 빌라 2층', NOW() - INTERVAL 25 DAY, 92, NOW() - INTERVAL 22 DAY, @h09
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[은평구] 베란다 거미 청소');

INSERT INTO requests (user_id, status, title, content, description, approx_location, exact_location, occurrence_time, view_count, created_at, completed_hunter_id)
SELECT @u07, '완료', '[서대문구] 주방 날파리 완전 제거', '쓰레기통 살균 + 방충 처리', '날파리 사라졌습니다', '서대문구', '서대문구 홍제동 단독주택', NOW() - INTERVAL 28 DAY, 145, NOW() - INTERVAL 25 DAY, @h10
WHERE NOT EXISTS (SELECT 1 FROM requests WHERE title = '[서대문구] 주방 날파리 완전 제거');

-- ============================================================
-- chat_rooms (예약 완료 4 + 완료 6 = 10건)
-- ============================================================

-- 예약 완료 채팅방
INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u11, @h01, NOW() - INTERVAL 4 DAY, NOW() + INTERVAL 2 DAY
FROM requests r WHERE r.title = '[영등포구] 사무실 개미 떼 방제 요청'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u12, @h02, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 1 DAY
FROM requests r WHERE r.title = '[구로구] 다용도실 쥐 흔적 발견'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u13, @h03, NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 3 DAY
FROM requests r WHERE r.title = '[관악구] 옥상 처마에 말벌집'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u01, @h04, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 4 DAY
FROM requests r WHERE r.title = '[종로구] 한옥 마당 모기 방제'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

-- 완료 채팅방
INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u02, @h05, NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 9 DAY
FROM requests r WHERE r.title = '[양천구] 부엌 바퀴벌레 완전 방제'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u03, @h06, NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 14 DAY
FROM requests r WHERE r.title = '[강서구] 욕실 지네 박멸 의뢰'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u04, @h07, NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 12 DAY
FROM requests r WHERE r.title = '[노원구] 천장 쥐 퇴치 완료'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u05, @h08, NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 16 DAY
FROM requests r WHERE r.title = '[도봉구] 거실 모기 종합 방제'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u06, @h09, NOW() - INTERVAL 21 DAY, NOW() - INTERVAL 19 DAY
FROM requests r WHERE r.title = '[은평구] 베란다 거미 청소'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

INSERT INTO chat_rooms (request_id, user_id, hunter_id, created_at, reserved_at)
SELECT r.request_id, @u07, @h10, NOW() - INTERVAL 24 DAY, NOW() - INTERVAL 22 DAY
FROM requests r WHERE r.title = '[서대문구] 주방 날파리 완전 제거'
  AND NOT EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.request_id = r.request_id);

-- ============================================================
-- applications (예약 완료 + 완료 = 10건)
-- ============================================================

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h01 FROM requests r WHERE r.title = '[영등포구] 사무실 개미 떼 방제 요청'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h01);

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h02 FROM requests r WHERE r.title = '[구로구] 다용도실 쥐 흔적 발견'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h02);

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h03 FROM requests r WHERE r.title = '[관악구] 옥상 처마에 말벌집'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h03);

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h04 FROM requests r WHERE r.title = '[종로구] 한옥 마당 모기 방제'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h04);

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h05 FROM requests r WHERE r.title = '[양천구] 부엌 바퀴벌레 완전 방제'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h05);

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h06 FROM requests r WHERE r.title = '[강서구] 욕실 지네 박멸 의뢰'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h06);

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h07 FROM requests r WHERE r.title = '[노원구] 천장 쥐 퇴치 완료'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h07);

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h08 FROM requests r WHERE r.title = '[도봉구] 거실 모기 종합 방제'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h08);

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h09 FROM requests r WHERE r.title = '[은평구] 베란다 거미 청소'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h09);

INSERT INTO applications (request_id, hunter_id)
SELECT r.request_id, @h10 FROM requests r WHERE r.title = '[서대문구] 주방 날파리 완전 제거'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.request_id = r.request_id AND a.hunter_id = @h10);

-- ============================================================
-- reviews (완료 6건)
-- ============================================================

INSERT INTO reviews (request_id, hunter_id, rating, review_content, created_at, updated_at)
SELECT r.request_id, @h05, 4.5, '꼼꼼하게 봐주셨어요. 재방문 약속도 지키셨고 만족합니다.', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY
FROM requests r WHERE r.title = '[양천구] 부엌 바퀴벌레 완전 방제'
  AND NOT EXISTS (SELECT 1 FROM reviews rv WHERE rv.request_id = r.request_id);

INSERT INTO reviews (request_id, hunter_id, rating, review_content, created_at, updated_at)
SELECT r.request_id, @h06, 5.0, '최고였습니다. 벽 틈새까지 다 막아주시고 설명도 친절했어요.', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY
FROM requests r WHERE r.title = '[강서구] 욕실 지네 박멸 의뢰'
  AND NOT EXISTS (SELECT 1 FROM reviews rv WHERE rv.request_id = r.request_id);

INSERT INTO reviews (request_id, hunter_id, rating, review_content, created_at, updated_at)
SELECT r.request_id, @h07, 4.0, '쥐는 잡혔는데 시간이 좀 오래 걸렸어요. 그래도 깔끔합니다.', NOW() - INTERVAL 13 DAY, NOW() - INTERVAL 13 DAY
FROM requests r WHERE r.title = '[노원구] 천장 쥐 퇴치 완료'
  AND NOT EXISTS (SELECT 1 FROM reviews rv WHERE rv.request_id = r.request_id);

INSERT INTO reviews (request_id, hunter_id, rating, review_content, created_at, updated_at)
SELECT r.request_id, @h08, 4.8, '연막 효과가 확실하네요. 방충망까지 보수해주셔서 든든합니다.', NOW() - INTERVAL 17 DAY, NOW() - INTERVAL 17 DAY
FROM requests r WHERE r.title = '[도봉구] 거실 모기 종합 방제'
  AND NOT EXISTS (SELECT 1 FROM reviews rv WHERE rv.request_id = r.request_id);

INSERT INTO reviews (request_id, hunter_id, rating, review_content, created_at, updated_at)
SELECT r.request_id, @h09, 3.5, '깨끗하긴 한데 약속 시간보다 늦게 오셨어요.', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY
FROM requests r WHERE r.title = '[은평구] 베란다 거미 청소'
  AND NOT EXISTS (SELECT 1 FROM reviews rv WHERE rv.request_id = r.request_id);

INSERT INTO reviews (request_id, hunter_id, rating, review_content, created_at, updated_at)
SELECT r.request_id, @h10, 4.7, '날파리가 완전히 사라졌습니다. 추천!', NOW() - INTERVAL 23 DAY, NOW() - INTERVAL 23 DAY
FROM requests r WHERE r.title = '[서대문구] 주방 날파리 완전 제거'
  AND NOT EXISTS (SELECT 1 FROM reviews rv WHERE rv.request_id = r.request_id);
