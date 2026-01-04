// Seed script for Embedded Systems courses and problems
// Run with: node src/utils/seedEmbeddedSystems.js

import sequelize from '../config/database.js';
import { Problem, TestCase, Course } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const embeddedSystemsCourses = [
  {
    title: 'Introduction to Embedded Systems',
    description: `Learn the fundamentals of embedded systems, including microcontrollers, sensors, and basic programming concepts. This course covers ARM architecture basics, GPIO operations, and hands-on projects with development boards.`,
    level: 'BEGINNER',
    duration: '4 weeks',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'
  },
  {
    title: 'ARM Cortex-M Programming',
    description: `Master ARM Cortex-M microcontrollers. Learn about registers, memory management, interrupts, and low-level programming. Build real-world applications using STM32 and other popular ARM-based boards.`,
    level: 'INTERMEDIATE',
    duration: '6 weeks',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500'
  },
  {
    title: 'Real-Time Operating Systems (RTOS)',
    description: `Deep dive into FreeRTOS, learn task scheduling, semaphores, mutexes, and message queues. Understand real-time constraints and how to build responsive embedded applications.`,
    level: 'INTERMEDIATE',
    duration: '5 weeks',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'
  },
  {
    title: 'IoT and Wireless Communication',
    description: `Explore IoT protocols (WiFi, Bluetooth, Zigbee), MQTT, and cloud connectivity. Build smart devices that communicate wirelessly and integrate with cloud services.`,
    level: 'INTERMEDIATE',
    duration: '6 weeks',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500'
  },
  {
    title: 'Embedded Linux Development',
    description: `Learn to build and customize Linux for embedded systems. Cover Yocto Project, device drivers, kernel modules, and cross-compilation. Work with Raspberry Pi and BeagleBone.`,
    level: 'ADVANCED',
    duration: '8 weeks',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500'
  },
  {
    title: 'Sensor Integration and Data Acquisition',
    description: `Master interfacing with sensors (temperature, pressure, accelerometer, gyroscope). Learn ADC/DAC, I2C, SPI protocols, and signal conditioning techniques.`,
    level: 'INTERMEDIATE',
    duration: '5 weeks',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'
  },
  {
    title: 'Power Management in Embedded Systems',
    description: `Optimize power consumption in battery-operated devices. Learn sleep modes, clock gating, voltage scaling, and power profiling techniques for energy-efficient designs.`,
    level: 'ADVANCED',
    duration: '4 weeks',
    image_url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=500'
  },
  {
    title: 'CAN Bus and Automotive Embedded Systems',
    description: `Understand Controller Area Network (CAN) protocol used in automotive applications. Build CAN communication systems and learn automotive standards and diagnostics.`,
    level: 'ADVANCED',
    duration: '6 weeks',
    image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500'
  },
  {
    title: 'FPGA Programming for Embedded Systems',
    description: `Introduction to Field Programmable Gate Arrays. Learn Verilog/VHDL, implement digital logic, and create custom hardware accelerators for embedded applications.`,
    level: 'ADVANCED',
    duration: '8 weeks',
    image_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500'
  },
  {
    title: 'Embedded Systems Security',
    description: `Secure embedded devices against threats. Learn encryption, secure boot, firmware protection, side-channel attacks, and best practices for building secure IoT devices.`,
    level: 'ADVANCED',
    duration: '6 weeks',
    image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500'
  }
];

const embeddedSystemsProblems = [
  {
    title: 'GPIO Pin Configuration',
    description: `Write a function to configure a GPIO pin as output with push-pull mode and set it to high.

Given:
- pin_number: The GPIO pin number (0-15)
- port: The port letter ('A', 'B', 'C', etc.)

Implement a function that:
1. Configures the pin as output
2. Sets push-pull mode
3. Sets the pin to high (logic 1)

Return: "Pin {port}{pin_number} configured as output, set to HIGH"`,
    difficulty: 'EASY',
    constraints: `0 <= pin_number <= 15
port is one of: 'A', 'B', 'C', 'D', 'E', 'F'`,
    sample_input: 'pin_number=5, port="A"',
    sample_output: 'Pin A5 configured as output, set to HIGH',
    testCases: [
      {
        input: '5\nA',
        expected_output: 'Pin A5 configured as output, set to HIGH',
        is_hidden: false
      },
      {
        input: '12\nB',
        expected_output: 'Pin B12 configured as output, set to HIGH',
        is_hidden: true
      },
      {
        input: '0\nC',
        expected_output: 'Pin C0 configured as output, set to HIGH',
        is_hidden: true
      }
    ]
  },
  {
    title: 'PWM Duty Cycle Calculation',
    description: `Calculate the PWM duty cycle percentage given the timer period and pulse width.

Formula: duty_cycle = (pulse_width / period) * 100

Given:
- period: Timer period in microseconds (1-10000)
- pulse_width: Pulse width in microseconds (0 <= pulse_width <= period)

Calculate and return the duty cycle as a percentage rounded to 2 decimal places.`,
    difficulty: 'EASY',
    constraints: `1 <= period <= 10000
0 <= pulse_width <= period`,
    sample_input: 'period=1000, pulse_width=250',
    sample_output: '25.00',
    testCases: [
      {
        input: '1000\n250',
        expected_output: '25.00',
        is_hidden: false
      },
      {
        input: '2000\n1500',
        expected_output: '75.00',
        is_hidden: true
      },
      {
        input: '5000\n1250',
        expected_output: '25.00',
        is_hidden: true
      }
    ]
  },
  {
    title: 'ADC Value Conversion',
    description: `Convert a 12-bit ADC raw value to voltage.

Given:
- adc_value: Raw ADC reading (0-4095 for 12-bit ADC)
- vref: Reference voltage in volts (typically 3.3V)
- resolution: ADC resolution in bits (12)

Formula: voltage = (adc_value / (2^resolution - 1)) * vref

Return the voltage rounded to 3 decimal places.`,
    difficulty: 'EASY',
    constraints: `0 <= adc_value <= 4095
1.0 <= vref <= 5.0
resolution = 12`,
    sample_input: 'adc_value=2048, vref=3.3',
    sample_output: '1.650',
    testCases: [
      {
        input: '2048\n3.3',
        expected_output: '1.650',
        is_hidden: false
      },
      {
        input: '4095\n3.3',
        expected_output: '3.300',
        is_hidden: true
      },
      {
        input: '1024\n5.0',
        expected_output: '1.250',
        is_hidden: true
      }
    ]
  },
  {
    title: 'I2C Address Scanner',
    description: `Scan I2C bus for device addresses. Given a list of I2C addresses to check, return the addresses that respond (ACK).

Standard I2C addresses range from 0x08 to 0x77 (7-bit addressing).

Given:
- addresses: List of addresses to check (as integers)

Return a list of addresses that respond (ACK), sorted in ascending order. Format each address as "0xXX".`,
    difficulty: 'MEDIUM',
    constraints: `1 <= number of addresses <= 16
All addresses are valid 7-bit I2C addresses`,
    sample_input: 'addresses=[0x48, 0x68, 0x50, 0x76]',
    sample_output: '0x48, 0x50, 0x68, 0x76',
    testCases: [
      {
        input: '0x48\n0x68\n0x50\n0x76',
        expected_output: '0x48, 0x50, 0x68, 0x76',
        is_hidden: false
      },
      {
        input: '0x20\n0x21',
        expected_output: '0x20, 0x21',
        is_hidden: true
      }
    ]
  },
  {
    title: 'Interrupt Priority Handler',
    description: `Implement an interrupt priority handler. Given interrupt priorities (higher number = higher priority), determine which interrupt should be serviced first.

If two interrupts occur simultaneously:
- Higher priority wins
- If same priority, lower interrupt number wins

Given:
- interrupts: List of tuples (interrupt_number, priority)

Return the interrupt number that should be serviced first.`,
    difficulty: 'MEDIUM',
    constraints: `1 <= number of interrupts <= 10
0 <= interrupt_number <= 255
0 <= priority <= 15`,
    sample_input: 'interrupts=[(5, 10), (3, 12), (7, 10)]',
    sample_output: '3',
    testCases: [
      {
        input: '5 10\n3 12\n7 10',
        expected_output: '3',
        is_hidden: false
      },
      {
        input: '1 5\n2 5\n3 5',
        expected_output: '1',
        is_hidden: true
      }
    ]
  },
  {
    title: 'Timer Period Calculation',
    description: `Calculate timer period register value for a desired frequency.

Given:
- desired_freq: Desired output frequency in Hz
- system_clock: System clock frequency in Hz
- prescaler: Prescaler value (1, 2, 4, 8, 16, 32, 64, 128)

Formula: period = (system_clock / (prescaler * desired_freq)) - 1

Return the period value (rounded to nearest integer). If result is invalid (< 1 or > 65535), return -1.`,
    difficulty: 'MEDIUM',
    constraints: `1 <= desired_freq <= 1000000
1000000 <= system_clock <= 200000000
prescaler is one of: 1, 2, 4, 8, 16, 32, 64, 128`,
    sample_input: 'desired_freq=1000, system_clock=8000000, prescaler=8',
    sample_output: '999',
    testCases: [
      {
        input: '1000\n8000000\n8',
        expected_output: '999',
        is_hidden: false
      },
      {
        input: '50\n16000000\n64',
        expected_output: '4999',
        is_hidden: true
      }
    ]
  },
  {
    title: 'CRC32 Calculation',
    description: `Calculate CRC32 checksum for embedded communication protocols.

Given a byte array, calculate CRC32 using the polynomial 0x04C11DB7.

Implement a function that takes bytes and returns the CRC32 value as a hexadecimal string (uppercase, with 0x prefix).`,
    difficulty: 'HARD',
    constraints: `1 <= number of bytes <= 256
Each byte is in range 0-255`,
    sample_input: 'bytes=[0x01, 0x02, 0x03]',
    sample_output: '0x8BB9E5B3',
    testCases: [
      {
        input: '1\n2\n3',
        expected_output: '0x8BB9E5B3',
        is_hidden: false
      },
      {
        input: '0',
        expected_output: '0xD202EF8D',
        is_hidden: true
      }
    ]
  },
  {
    title: 'FreeRTOS Task State Manager',
    description: `Simulate FreeRTOS task states. Given a list of tasks with priorities, calculate which tasks are running, ready, or blocked.

Task states:
- Running: Highest priority task
- Ready: Tasks waiting to run (priority > 0)
- Blocked: Tasks waiting for event (marked as blocked)

Given:
- tasks: List of (task_id, priority, is_blocked)

Return: "Running: {id}, Ready: {ids}, Blocked: {ids}"`,
    difficulty: 'HARD',
    constraints: `1 <= number of tasks <= 10
0 <= priority <= 10
At least one task is not blocked`,
    sample_input: 'tasks=[(1, 5, False), (2, 3, False), (3, 2, True)]',
    sample_output: 'Running: 1, Ready: 2, Blocked: 3',
    testCases: [
      {
        input: '1 5 0\n2 3 0\n3 2 1',
        expected_output: 'Running: 1, Ready: 2, Blocked: 3',
        is_hidden: false
      }
    ]
  },
  {
    title: 'SPI Data Frame Parser',
    description: `Parse SPI data frame with start byte, length, data, and checksum.

Frame format:
- Start byte: 0xAA
- Length: 1 byte (data length, 1-255)
- Data: N bytes
- Checksum: XOR of all bytes except start

Given a byte array, validate and extract the data payload.
- If valid, return data bytes as space-separated hex values
- If invalid, return "INVALID"`,
    difficulty: 'HARD',
    constraints: `Frame length >= 3 bytes
Valid frames have correct checksum`,
    sample_input: 'frame=[0xAA, 0x03, 0x01, 0x02, 0x03, 0x05]',
    sample_output: '01 02 03',
    testCases: [
      {
        input: '0xAA\n0x03\n0x01\n0x02\n0x03\n0x05',
        expected_output: '01 02 03',
        is_hidden: false
      }
    ]
  },
  {
    title: 'Watchdog Timer Configuration',
    description: `Calculate watchdog timer reload value for a timeout duration.

Given:
- timeout_ms: Desired timeout in milliseconds
- clock_freq: Watchdog clock frequency in Hz
- prescaler: Prescaler value (1, 2, 4, 8, 16, 32, 64, 128)

Formula: reload_value = (timeout_ms * clock_freq * prescaler) / 1000

Return the reload value rounded to nearest integer. If invalid (> 65535), return -1.`,
    difficulty: 'MEDIUM',
    constraints: `1 <= timeout_ms <= 10000
1000 <= clock_freq <= 1000000
prescaler is one of: 1, 2, 4, 8, 16, 32, 64, 128`,
    sample_input: 'timeout_ms=1000, clock_freq=32000, prescaler=4',
    sample_output: '128000',
    testCases: [
      {
        input: '1000\n32000\n4',
        expected_output: '128000',
        is_hidden: false
      },
      {
        input: '500\n16000\n8',
        expected_output: '64000',
        is_hidden: true
      }
    ]
  }
];

const seedEmbeddedSystems = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('Models synchronized.');

    // Add courses
    console.log('\nAdding Embedded Systems Courses...');
    for (const courseData of embeddedSystemsCourses) {
      const course = await Course.create(courseData);
      console.log(`✓ Created course: ${course.title}`);
    }

    // Add problems
    console.log('\nAdding Embedded Systems Problems...');
    for (const problemData of embeddedSystemsProblems) {
      const { testCases, ...problemFields } = problemData;
      const problem = await Problem.create(problemFields);
      console.log(`✓ Created problem: ${problem.title}`);

      // Add test cases
      for (const testCaseData of testCases) {
        await TestCase.create({
          ...testCaseData,
          problem_id: problem.id
        });
      }
    }

    console.log('\n✓ Embedded Systems seeding completed successfully!');
    console.log(`  - ${embeddedSystemsCourses.length} courses created`);
    console.log(`  - ${embeddedSystemsProblems.length} problems created`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedEmbeddedSystems();

