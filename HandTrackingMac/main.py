import sys
import subprocess
import time
from pathlib import Path

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

from PySide6.QtCore import Qt, QTimer, QProcess
from PySide6.QtGui import QImage, QPixmap, QFont
from PySide6.QtWidgets import (
    QApplication,
    QWidget,
    QLabel,
    QProgressBar,
    QPushButton,
    QVBoxLayout,
    QHBoxLayout
)


# settings
PROCESSING_FPS = 60
VOLUME_SYNC_INTERVAL_MS = 100

CAMERA_WIDTH = 320 
CAMERA_HEIGHT = 240 

VOLUME_INCREASE_AMOUNT = 2
VOLUME_DECREASE_AMOUNT = 2

THUMBS_UP_INTERVAL = 0.2
THUMBS_DOWN_INTERVAL = 0.2

REQUIRED_GESTURE_CHECKS = 3

MODEL_PATH = Path(__file__).with_name(
    "hand_landmarker.task"
)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Unable to open model file at {MODEL_PATH}"
    )


# =========================================================
# MAC VOLUME
# =========================================================

def get_mac_volume(default=50):
    try:
        result = subprocess.check_output(
            [
                "osascript",
                "-e",
                "output volume of (get volume settings)"
            ],
            text=True
        )

        return int(result.strip())

    except Exception as error:
        print("Could not read volume:", error)
        return default


def set_mac_volume(volume):
    volume = max(0, min(100, int(volume)))

    try:
        subprocess.run(
            [
                "osascript",
                "-e",
                f"set volume output volume {volume}"
            ],
            check=True
        )

    except Exception as error:
        print("Could not change volume:", error)


# Mediapipe
base_options = python.BaseOptions(
    model_asset_path=str(MODEL_PATH)
)

options = vision.HandLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.VIDEO,
    num_hands=1,
    min_hand_detection_confidence=0.55,
    min_hand_presence_confidence=0.55,
    min_tracking_confidence=0.55
)

hand_landmarker = vision.HandLandmarker.create_from_options(
    options
)


# Hand Functions
def point_distance(point_1, point_2):
    return (
        (point_1.x - point_2.x) ** 2
        + (point_1.y - point_2.y) ** 2
    ) ** 0.5


def finger_is_open(landmarks, tip_number, middle_number):
    wrist = landmarks[0]

    return (
        point_distance(
            landmarks[tip_number],
            wrist
        )
        >
        point_distance(
            landmarks[middle_number],
            wrist
        ) * 1.12
    )


def finger_is_curled(landmarks, tip_number, middle_number):
    wrist = landmarks[0]

    return (
        point_distance(
            landmarks[tip_number],
            wrist
        )
        <
        point_distance(
            landmarks[middle_number],
            wrist
        ) * 1.20
    )


def recognize_gesture(landmarks):
    wrist = landmarks[0]

    thumb_base = landmarks[2]
    thumb_joint = landmarks[3]
    thumb_tip = landmarks[4]
    index_base = landmarks[5]

    # Peace Sign = 100%
    index_open = finger_is_open(landmarks, 8, 6)
    middle_open = finger_is_open(landmarks, 12, 10)
    ring_curled_for_peace = finger_is_curled(landmarks, 16, 14)
    pinky_curled_for_peace = finger_is_curled(landmarks, 20, 18)

    if (
        index_open
        and middle_open
        and ring_curled_for_peace
        and pinky_curled_for_peace
    ):
        return "Peace sign"

    # CURLED FINGERS
    index_curled = finger_is_curled(landmarks, 8, 6)
    middle_curled = finger_is_curled(landmarks, 12, 10)
    ring_curled = finger_is_curled(landmarks, 16, 14)
    pinky_curled = finger_is_curled(landmarks, 20, 18)

    all_fingers_curled = (
        index_curled
        and middle_curled
        and ring_curled
        and pinky_curled
    )

    # THUMBS UP
    thumb_points_up = (
        thumb_tip.y < thumb_joint.y
        and thumb_tip.y < thumb_base.y
        and thumb_tip.y < index_base.y
        and thumb_tip.y < wrist.y + 0.05
    )

    if all_fingers_curled and thumb_points_up:
        return "Thumbs up"

    # THUMBS DOWN
    thumb_points_down = (
        thumb_tip.y > thumb_joint.y
        and thumb_tip.y > thumb_base.y
        and thumb_tip.y > index_base.y
        and thumb_tip.y > wrist.y - 0.05
    )

    if all_fingers_curled and thumb_points_down:
        return "Thumbs down"

    return "Other gesture"


# =========================================================
# DRAW HAND
# =========================================================

HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (17, 18), (18, 19), (19, 20),
    (0, 17)
]


def draw_hand(frame, landmarks):
    height, width, _ = frame.shape

    points = []

    for landmark in landmarks:
        x = int(landmark.x * width)
        y = int(landmark.y * height)

        points.append((x, y))

    for start, end in HAND_CONNECTIONS:
        cv2.line(
            frame,
            points[start],
            points[end],
            (255, 255, 255),
            2
        )

    for point in points:
        cv2.circle(
            frame,
            point,
            4,
            (255, 255, 255),
            -1
        )


# =========================================================
# MAIN WINDOW
# =========================================================

class HandVolumeWindow(QWidget):

    def __init__(self):
        super().__init__()

        self.setWindowTitle("Hand Volume Controller")
        self.setFixedSize(520, 650)

        self.setStyleSheet("""
            QWidget {
                background-color: white;
                color: black;
            }

            QProgressBar {
                border: 1px solid #bdbdbd;
                border-radius: 5px;
                height: 18px;
                background-color: #eeeeee;
                text-align: center;
            }

            QProgressBar::chunk {
                background-color: #4c89ff;
                border-radius: 4px;
            }

            QPushButton {
                background-color: #eeeeee;
                border: 1px solid #aaaaaa;
                border-radius: 5px;
                padding: 8px 18px;
                font-size: 14px;
            }

            QPushButton:hover {
                background-color: #dddddd;
            }
        """)

        self.camera = cv2.VideoCapture(0)

        # Ask the camera for the target capture rate. Some webcams/macOS
        # drivers may cap this lower, but setting it makes the intent explicit.
        self.camera.set(
            cv2.CAP_PROP_FPS,
            PROCESSING_FPS
        )

        # Keep latency low if the backend supports this property.
        self.camera.set(
            cv2.CAP_PROP_BUFFERSIZE,
            1
        )

        self.camera.set(
            cv2.CAP_PROP_FRAME_WIDTH,
            CAMERA_WIDTH
        )

        self.camera.set(
            cv2.CAP_PROP_FRAME_HEIGHT,
            CAMERA_HEIGHT
        )

        self.previous_gesture = ""
        self.gesture_check_count = 0
        self.confirmed_gesture = "No hand"

        self.peace_sign_used = False

        self.last_thumbs_up_time = 0
        self.last_thumbs_down_time = 0

        # Reading macOS volume launches osascript, so do it once instead of
        # launching a subprocess on every camera frame.
        self.current_volume = get_mac_volume()

        # Used to ignore system volume readings that started before the app
        # last changed the volume, so stale values don't undo a gesture.
        self.last_volume_set_time = 0
        self.volume_read_start_time = 0

        self.build_gui()

        self.timer = QTimer(self)

        self.timer.setTimerType(
            Qt.PreciseTimer
        )

        self.timer.timeout.connect(
            self.update_camera
        )

        self.timer.start(
            int(1000 / PROCESSING_FPS)
        )

        # Read system volume asynchronously so keyboard changes appear almost
        # immediately without blocking camera or gesture processing.
        self.volume_process = QProcess(self)

        self.volume_process.readyReadStandardOutput.connect(
            self.handle_system_volume
        )

        self.volume_sync_timer = QTimer(self)

        self.volume_sync_timer.timeout.connect(
            self.sync_system_volume
        )

        self.volume_sync_timer.start(
            VOLUME_SYNC_INTERVAL_MS
        )


    # =====================================================
    # GUI
    # =====================================================

    def build_gui(self):

        layout = QVBoxLayout()

        layout.setContentsMargins(
            35,
            22,
            35,
            22
        )

        layout.setSpacing(10)


        # TITLE
        self.title_label = QLabel(
            "Hand Volume Controller"
        )

        self.title_label.setAlignment(
            Qt.AlignCenter
        )

        self.title_label.setFont(
            QFont("Arial", 20, QFont.Bold)
        )

        layout.addWidget(
            self.title_label
        )


        # CAMERA
        self.camera_label = QLabel(
            "Starting camera..."
        )

        self.camera_label.setFixedSize(
            CAMERA_WIDTH,
            CAMERA_HEIGHT
        )

        self.camera_label.setAlignment(
            Qt.AlignCenter
        )

        self.camera_label.setStyleSheet(
            "background-color: black; color: white;"
        )


        camera_row = QHBoxLayout()

        camera_row.addStretch()

        camera_row.addWidget(
            self.camera_label
        )

        camera_row.addStretch()

        layout.addLayout(
            camera_row
        )


        # CURRENT VOLUME
        self.volume_label = QLabel(
            "Current volume: --%"
        )

        self.volume_label.setAlignment(
            Qt.AlignCenter
        )

        self.volume_label.setFont(
            QFont("Arial", 22, QFont.Bold)
        )

        layout.addWidget(
            self.volume_label
        )


        # PROGRESS BAR
        self.volume_bar = QProgressBar()

        self.volume_bar.setRange(
            0,
            100
        )

        self.volume_bar.setValue(
            self.current_volume
        )

        layout.addWidget(
            self.volume_bar
        )


        # GESTURE
        self.gesture_label = QLabel(
            "Gesture: No hand"
        )

        self.gesture_label.setAlignment(
            Qt.AlignCenter
        )

        self.gesture_label.setFont(
            QFont("Arial", 15)
        )

        layout.addWidget(
            self.gesture_label
        )


        # CHANGE
        self.change_label = QLabel(
            "Change: No change yet"
        )

        self.change_label.setAlignment(
            Qt.AlignCenter
        )

        self.change_label.setFont(
            QFont("Arial", 15)
        )

        layout.addWidget(
            self.change_label
        )


        # CAMERA STATUS
        self.status_label = QLabel(
            "Camera: Running"
        )

        self.status_label.setAlignment(
            Qt.AlignCenter
        )

        self.status_label.setFont(
            QFont("Arial", 11)
        )

        layout.addWidget(
            self.status_label
        )


        # INSTRUCTIONS
        self.instructions_label = QLabel(
            f"Thumbs up = increase volume by {VOLUME_INCREASE_AMOUNT}%\n"
            f"Thumbs down = decrease volume by {VOLUME_DECREASE_AMOUNT}%\n"
            "Peace sign = set volume to 100%\n"
        )

        self.instructions_label.setAlignment(
            Qt.AlignCenter
        )

        self.instructions_label.setFont(
            QFont("Arial", 12)
        )

        layout.addWidget(
            self.instructions_label
        )


        # STOP BUTTON
        self.stop_button = QPushButton(
            "Stop Program"
        )

        self.stop_button.clicked.connect(
            self.close
        )


        button_row = QHBoxLayout()

        button_row.addStretch()

        button_row.addWidget(
            self.stop_button
        )

        button_row.addStretch()

        layout.addLayout(
            button_row
        )


        self.setLayout(
            layout
        )


    def sync_system_volume(self):

        if (
            self.volume_process.state()
            != QProcess.ProcessState.NotRunning
        ):
            return

        self.volume_read_start_time = time.monotonic()

        self.volume_process.start(
            "osascript",
            [
                "-e",
                "output volume of (get volume settings)"
            ]
        )


    def handle_system_volume(self):

        output = bytes(
            self.volume_process.readAllStandardOutput()
        ).decode().strip()

        try:
            system_volume = int(output)
        except ValueError:
            return

        if self.volume_read_start_time < self.last_volume_set_time:
            return

        if system_volume == self.current_volume:
            return

        self.current_volume = system_volume

        self.volume_label.setText(
            f"Current volume: {system_volume}%"
        )

        self.volume_bar.setValue(
            system_volume
        )


    # =====================================================
    # CAMERA LOOP
    # =====================================================

    def update_camera(self):

        success, frame = self.camera.read()

        if not success:
            self.status_label.setText(
                "Camera: Could not read camera"
            )

            return


        frame = cv2.resize(
            frame,
            (
                CAMERA_WIDTH,
                CAMERA_HEIGHT
            )
        )


        frame = cv2.flip(
            frame,
            1
        )


        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )


        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )


        result = hand_landmarker.detect_for_video(
            mp_image,
            int(time.monotonic() * 1000)
        )


        detected_gesture = "No hand"


        if result.hand_landmarks:

            landmarks = (
                result.hand_landmarks[0]
            )


            detected_gesture = (
                recognize_gesture(
                    landmarks
                )
            )


            draw_hand(
                frame,
                landmarks
            )


        # STABILIZE
        if (
            detected_gesture
            == self.previous_gesture
        ):

            self.gesture_check_count += 1

        else:

            self.previous_gesture = (
                detected_gesture
            )

            self.gesture_check_count = 1

            # Stop the previous action immediately while a new gesture is
            # being confirmed. This prevents volume overshoot.
            self.confirmed_gesture = "Other gesture"


        if detected_gesture in ("No hand", "Other gesture"):

            self.confirmed_gesture = detected_gesture

        elif (
            self.gesture_check_count
            >= REQUIRED_GESTURE_CHECKS
        ):

            self.confirmed_gesture = (
                detected_gesture
            )


        current_volume = self.current_volume


        # PEACE SIGN = 100
        if (
            self.confirmed_gesture
            == "Peace sign"
        ):

            if not self.peace_sign_used:

                old_volume = (
                    current_volume
                )

                new_volume = 100

                set_mac_volume(
                    new_volume
                )

                amount = (
                    new_volume
                    - old_volume
                )

                if amount > 0:

                    self.change_label.setText(
                        f"Change: Increased by {amount}%"
                    )

                else:

                    self.change_label.setText(
                        "Change: Already at 100%"
                    )


                current_volume = (
                    new_volume
                )

                self.current_volume = new_volume


                self.last_volume_set_time = time.monotonic()

                self.peace_sign_used = (
                    True
                )

        else:

            self.peace_sign_used = (
                False
            )


        # THUMBS UP
        if (
            self.confirmed_gesture
            == "Thumbs up"
        ):

            current_time = (
                time.monotonic()
            )


            if (
                current_time
                - self.last_thumbs_up_time
                >= THUMBS_UP_INTERVAL
            ):

                old_volume = (
                    current_volume
                )

                new_volume = min(
                    100,
                    old_volume
                    + VOLUME_INCREASE_AMOUNT
                )

                set_mac_volume(
                    new_volume
                )

                amount = (
                    new_volume
                    - old_volume
                )

                if amount > 0:

                    self.change_label.setText(
                        f"Change: Increased by {amount}%"
                    )

                else:

                    self.change_label.setText(
                        "Change: Already at 100%"
                    )


                current_volume = (
                    new_volume
                )

                self.current_volume = new_volume


                self.last_volume_set_time = time.monotonic()

                self.last_thumbs_up_time = (
                    current_time
                )


        # THUMBS DOWN
        if (
            self.confirmed_gesture
            == "Thumbs down"
        ):

            current_time = (
                time.monotonic()
            )


            if (
                current_time
                - self.last_thumbs_down_time
                >= THUMBS_DOWN_INTERVAL
            ):

                old_volume = (
                    current_volume
                )

                new_volume = max(
                    0,
                    old_volume
                    - VOLUME_DECREASE_AMOUNT
                )

                set_mac_volume(
                    new_volume
                )

                amount = (
                    old_volume
                    - new_volume
                )

                if amount > 0:

                    self.change_label.setText(
                        f"Change: Decreased by {amount}%"
                    )

                else:

                    self.change_label.setText(
                        "Change: Already at 0%"
                    )


                current_volume = (
                    new_volume
                )

                self.current_volume = new_volume


                self.last_volume_set_time = time.monotonic()

                self.last_thumbs_down_time = (
                    current_time
                )


        # UPDATE GUI
        self.volume_label.setText(
            f"Current volume: {current_volume}%"
        )

        self.volume_bar.setValue(
            current_volume
        )

        self.gesture_label.setText(
            f"Gesture: {self.confirmed_gesture}"
        )

        self.status_label.setText(
            "Camera: Running"
        )


        # TEXT ON CAMERA
        cv2.putText(
            frame,
            f"Gesture: {self.confirmed_gesture}",
            (10, 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (255, 255, 255),
            2
        )


        cv2.putText(
            frame,
            f"Volume: {current_volume}%",
            (10, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (255, 255, 255),
            2
        )


        # SHOW CAMERA
        display_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )


        height, width, channels = (
            display_frame.shape
        )


        bytes_per_line = (
            channels * width
        )


        image = QImage(
            display_frame.data,
            width,
            height,
            bytes_per_line,
            QImage.Format_RGB888
        )


        pixmap = QPixmap.fromImage(
            image
        )


        self.camera_label.setPixmap(
            pixmap
        )


    # =====================================================
    # CLOSE
    # =====================================================

    def closeEvent(self, event):

        self.timer.stop()

        self.volume_sync_timer.stop()

        if (
            self.volume_process.state()
            != QProcess.ProcessState.NotRunning
        ):
            self.volume_process.kill()

            self.volume_process.waitForFinished(
                250
            )

        self.camera.release()

        hand_landmarker.close()

        event.accept()


# =========================================================
# START APP
# =========================================================

app = QApplication(
    sys.argv
)

window = HandVolumeWindow()

window.show()

sys.exit(
    app.exec()
)
