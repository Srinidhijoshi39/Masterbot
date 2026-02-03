from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os
from dotenv import load_dotenv
import re
from datetime import datetime

load_dotenv('.env.pc2')

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'port': os.getenv('DB_PORT')
}

def get_db():
    return psycopg2.connect(**DB_CONFIG)

def generate_client_id():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM clients")
    count = cur.fetchone()[0]
    conn.close()
    
    # Generate AA0001, AB0002, AC0003, etc.
    first_letter = chr(65 + (count // 26))  # A, B, C...
    second_letter = chr(65 + (count % 26))  # A-Z cycle
    number = count + 1
    return f"{first_letter}{second_letter}{number:04d}"

def generate_bot_id():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM bots")
    count = cur.fetchone()[0]
    conn.close()
    
    # Generate BA0001, BB0002, BC0003, etc. (starts with B)
    first_letter = chr(66 + (count // 26))  # B, C, D...
    second_letter = chr(65 + (count % 26))  # A-Z cycle
    number = count + 1
    return f"{first_letter}{second_letter}{number:04d}"

def is_valid_id_format(id_str):
    return bool(re.match(r'^[A-Z]{2}\d{4}$', id_str))

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Master Bot API is running', 'status': 'OK'})

@app.route('/register', methods=['POST'])
def register_client():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    
    if not all([name, email, phone]):
        return jsonify({'success': False, 'error': 'Missing required fields'})
    
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # Generate unique IDs
        client_id = generate_client_id()
        bot_id = generate_bot_id()
        
        # Insert client and bot
        cur.execute(
            "INSERT INTO clients (client_id, name, email, phone, created_at) VALUES (%s, %s, %s, %s, %s)",
            (client_id, name, email, phone, datetime.now())
        )
        cur.execute(
            "INSERT INTO bots (bot_id, client_id) VALUES (%s, %s)",
            (bot_id, client_id)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'client_id': client_id,
            'bot_id': bot_id
        })
        
    except psycopg2.IntegrityError:
        conn.rollback()
        conn.close()
        return jsonify({'success': False, 'error': 'Email or phone already exists'})
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'success': False, 'error': str(e)})

@app.route('/verify', methods=['POST'])
def verify_bot():
    data = request.json
    bot_id = data.get('bot_id')
    
    if not bot_id or not is_valid_id_format(bot_id):
        return jsonify({'authorized': False})
    
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "SELECT 1 FROM bots WHERE bot_id = %s AND status = 'ACTIVE'",
            (bot_id,)
        )
        authorized = cur.fetchone() is not None
        conn.close()
        
        return jsonify({'authorized': authorized})
    except:
        return jsonify({'authorized': False})

@app.route('/delete/<client_id>', methods=['DELETE'])
def delete_client(client_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # Delete bot first (foreign key constraint)
        cur.execute("DELETE FROM bots WHERE client_id = %s", (client_id,))
        # Delete client
        cur.execute("DELETE FROM clients WHERE client_id = %s", (client_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'success': False, 'error': str(e)})

@app.route('/stats', methods=['GET'])
def get_stats():
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # Get total clients
        cur.execute("SELECT COUNT(*) FROM clients")
        total_clients = cur.fetchone()[0]
        
        # Get total bots
        cur.execute("SELECT COUNT(*) FROM bots")
        total_bots = cur.fetchone()[0]
        
        # Get active bots
        cur.execute("SELECT COUNT(*) FROM bots WHERE status = 'ACTIVE'")
        active_bots = cur.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'total_clients': total_clients,
            'total_bots': total_bots,
            'active_bots': active_bots
        })
    except:
        return jsonify({
            'total_clients': 0,
            'total_bots': 0,
            'active_bots': 0
        })

@app.route('/clients', methods=['GET'])
def get_clients():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT c.client_id, c.name, c.email, c.phone, 
                   b.bot_id, c.created_at
            FROM clients c 
            LEFT JOIN bots b ON c.client_id = b.client_id 
        """)
        
        clients = []
        for row in cur.fetchall():
            clients.append({
                'client_id': row[0],
                'name': row[1],
                'email': row[2],
                'phone': row[3],
                'bot_id': row[4],
                'created_at': row[5].strftime('%d-%m-%Y') if row[5] else None
            })
        
        conn.close()
        return jsonify(clients)
    except:
        return jsonify([])

if __name__ == '__main__':
    print(f"PC2 Master Bot connecting to PC1 database at: {DB_CONFIG['host']}")
    app.run(debug=True, host='0.0.0.0', port=5000)