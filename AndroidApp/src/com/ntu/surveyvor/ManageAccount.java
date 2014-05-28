package com.ntu.surveyvor;

import java.io.IOException;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.view.Menu;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.ListView;

public class ManageAccount extends Activity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_manage_account);
        
        String[] manageAccountItems= {"Change Password", "Delete Account"};

        
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, 
                android.R.layout.simple_list_item_1, manageAccountItems);
        ListView listView = (ListView) findViewById(R.id.listView1);
        listView.setAdapter(adapter);
        
        listView.setOnItemClickListener(new OnItemClickListener() {
            public void onItemClick(AdapterView<?> parent, View view,
                int position, long id) {
            	switch( position )
                {
                   case 0:  Intent intent0 = new Intent(ManageAccount.this, ChangePassword.class);     
                            startActivity(intent0);
                            break;
                   case 1:  Intent intent1 = new Intent(ManageAccount.this, DeleteAccount.class);     
                   			startActivity(intent1);
                   			break;
                   
         
                }

            }
          });
    }



    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_manage_account, menu);
        return true;
    }
    
    }
